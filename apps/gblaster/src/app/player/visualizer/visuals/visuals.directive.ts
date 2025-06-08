import { Directive, effect, ElementRef, inject, input, OnDestroy } from '@angular/core';
import type { FrequencyBarsConfig, OsciloscopeConfig, VisualizerMode, VisualsColorConfig, VisualsWorkerMessage } from './visuals.types';
import { AudioService } from '../../audio.service';

const FALLBACK_PRIMARY_COLOR = '#424242';
const FALLBACK_ACCENT_COLOR = '#bcbcbc';
@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy {
  private audioService = inject(AudioService);

  readonly mode = input<VisualizerMode>('bars');

  readonly barsConfig = input<FrequencyBarsConfig>({ gap: 0, capHeight: 1, barCount: 24, capFalldown: 0.5 });

  readonly oscConfig = input<OsciloscopeConfig>({ thickness: 2 });

  readonly colorConfig = input<VisualsColorConfig>({});

  readonly analyser = input<AnalyserNode>();

  private _internalAnalyzer: AnalyserNode | undefined;

  private canvas: HTMLCanvasElement;

  private animationFrameRef?: number;

  private visualizerWorker: Worker;

  private resizeObserver: ResizeObserver;

  constructor() {
    const elr = inject<ElementRef<HTMLCanvasElement>>(ElementRef);

    this.canvas = elr.nativeElement;

    this.visualizerWorker = new Worker(new URL('visuals.worker', import.meta.url), { type: 'module' });
    // this.worker.onmessage = ({ data }) => {
    //   console.log(`page got message: ${data}`);
    // };

    const offscreenCanvas: OffscreenCanvas = this.canvas.transferControlToOffscreen();
    this.visualizerWorker.postMessage({ canvas: offscreenCanvas } as VisualsWorkerMessage, [offscreenCanvas]);

    this.resizeObserver = this.setupResizeObserver();
    effect(() => {
      // Access signals to establish dependencies
      const currentMode = this.mode();
      // const currentBarsConfig = this.barsConfig();
      // const currentOscConfig = this.oscConfig();
      // const currentColorConfig = this.colorConfig();
      // const currentAnalyser = this.analyser();

      this.stopVisualizer();

      // // give canvas size for correct dpi
      // const rect = this.canvas.getBoundingClientRect();
      // this.visualizerWorker.postMessage({ newSize: rect } as VisualsWorkerMessage);

      switch (currentMode) {
        case 'bars': {
          this.visualizeFrequencyBars(false);
          break;
        }
        case 'osc': {
          this.visualizeOscilloscope(false);
          break;
        }
        case 'circular-osc': {
          this.visualizeOscilloscope(true);
          break;
        }
        case 'circular-bars': {
          this.visualizeFrequencyBars(true);
          break;
        }
      }
    });
  }

  private setupResizeObserver() {
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      this.visualizerWorker.postMessage({ newSize: rect } as VisualsWorkerMessage);
    });
    observer.observe(this.canvas);
    return observer;
  }

  get analyserNode(): AnalyserNode {
    const analyserValue = this.analyser();
    if (analyserValue) {
      return analyserValue;
    } else {
      if (!this._internalAnalyzer) {
        this._internalAnalyzer = this.audioService.plugInNewAnalyserNode();
      }
      return this._internalAnalyzer;
    }
  }

  visualizeFrequencyBars(circular: boolean) {
    const colorConfig = this.colorConfig();
    this.visualizerWorker.postMessage({
      visualizerOptions: {
        mode: circular ? 'circular-bars' : 'bars',
        barCount: this.barsConfig().barCount,
        gap: this.barsConfig().gap,
        capHeight: this.barsConfig().capHeight,
        capFalldown: this.barsConfig().capFalldown,
        mainColor: colorConfig?.mainColor || FALLBACK_PRIMARY_COLOR,
        peakColor: colorConfig?.peakColor || FALLBACK_ACCENT_COLOR,
        alpha: colorConfig?.alpha ?? 1,
        bufferLength: this.analyserNode.frequencyBinCount,
        fftSize: this.analyserNode.fftSize,
        sampleRate: this.audioService.sampleRate()
      }
    } as VisualsWorkerMessage);

    this.startVisualization('getByteFrequencyData');
  }

  visualizeOscilloscope(circular: boolean) {
    const colorConfig = this.colorConfig();
    this.visualizerWorker.postMessage({
      visualizerOptions: {
        mode: circular ? 'circular-osc' : 'osc',
        mainColor: colorConfig?.mainColor || FALLBACK_PRIMARY_COLOR,
        peakColor: colorConfig?.peakColor || FALLBACK_ACCENT_COLOR,
        alpha: colorConfig?.alpha ?? 1,
        bufferLength: this.analyserNode.frequencyBinCount,
        thickness: this.oscConfig().thickness
      }
    } as VisualsWorkerMessage);

    this.startVisualization('getByteTimeDomainData');
  }

  private startVisualization(getDataMethod: 'getByteFrequencyData' | 'getByteTimeDomainData') {
    const bufferSize = this.analyserNode.frequencyBinCount;

    // Create a buffer pool with more buffers for better rotation
    const bufferPool: Uint8Array[] = [];
    for (let i = 0; i < 3; i++) {
      bufferPool.push(new Uint8Array(bufferSize));
    }

    // Track available buffers
    const availableBuffers: Uint8Array[] = [...bufferPool];
    let lastUpdateTime = 0;
    const updateInterval = 1000 / 60; // Limit to 60fps

    // Handle worker messages
    this.visualizerWorker.addEventListener('message', (event) => {
      if (event.data.bufferReady && event.data.reusableBuffer) {
        // Worker finished with the buffer, add it back to available buffers
        availableBuffers.push(event.data.reusableBuffer);
      }
    });

    const draw = () => {
      const now = performance.now();
      const timeSinceLastUpdate = now - lastUpdateTime;

      // Only process if we have an available buffer and enough time has passed
      if (timeSinceLastUpdate >= updateInterval && availableBuffers.length > 0) {
        // Get a buffer from the available pool
        const buffer = availableBuffers.shift()!;

        // Fill it with data
        this.analyserNode[getDataMethod](buffer);

        // Send to worker (transfers ownership of the buffer)
        this.visualizerWorker.postMessage({ analyserData: buffer }, [buffer.buffer]);

        lastUpdateTime = now;
      }

      this.animationFrameRef = requestAnimationFrame(draw);
    };

    draw();
  }

  stopVisualizer() {
    this.visualizerWorker.postMessage({ stop: true } as VisualsWorkerMessage);
    if (this.animationFrameRef !== undefined) {
      cancelAnimationFrame(this.animationFrameRef);
    }
  }

  ngOnDestroy() {
    this.stopVisualizer();
    this.resizeObserver.disconnect();

    // Disconnect internal analyzer if it exists
    if (this._internalAnalyzer) {
      this.audioService.disconnectAnalyserNode(this._internalAnalyzer);
    }

    this.visualizerWorker.terminate();
  }
}
