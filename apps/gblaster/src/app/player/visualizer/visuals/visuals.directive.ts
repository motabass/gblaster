import { Directive, effect, ElementRef, inject, input, OnDestroy } from '@angular/core';
import type {
  FrequencyBarsConfig,
  OsciloscopeConfig,
  VisualizerMode,
  VisualizerOptions,
  VisualsColorConfig,
  VisualsWorkerResponse
} from './visuals.types';
import { AudioService } from '../../audio.service';

const FALLBACK_PRIMARY_COLOR = '#424242';
const FALLBACK_ACCENT_COLOR = '#bcbcbc';
@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy {
  private audioService = inject(AudioService);
  private _internalAnalyzer: AnalyserNode | undefined;
  private readonly canvas: HTMLCanvasElement;
  private animationFrameRef?: number;
  private visualizerWorker: Worker;
  private resizeObserver: ResizeObserver;
  private readonly availableBuffers: Uint8Array<ArrayBuffer>[] = [];
  private activeDataMethod: 'getByteFrequencyData' | 'getByteTimeDomainData' | undefined;
  private activeAnalyser: AnalyserNode | undefined;
  private bufferSize = 0;
  private lastUpdateTime = 0;
  private readonly updateInterval = 1000 / 60;

  private readonly handleWorkerMessage = (event: MessageEvent<VisualsWorkerResponse>) => {
    const buffer = event.data.reusableBuffer;
    if (
      event.data.bufferReady &&
      buffer?.byteLength === this.bufferSize &&
      this.activeDataMethod &&
      this.availableBuffers.length < 3
    ) {
      this.availableBuffers.push(buffer);
    }
  };

  private readonly draw = (): void => {
    const dataMethod = this.activeDataMethod;
    const analyser = this.activeAnalyser;

    if (!dataMethod || !analyser) {
      this.animationFrameRef = undefined;
      return;
    }

    const now = performance.now();
    if (now - this.lastUpdateTime >= this.updateInterval) {
      const buffer = this.availableBuffers.pop();
      if (buffer) {
        analyser[dataMethod](buffer);
        this.visualizerWorker.postMessage({ analyserData: buffer }, [buffer.buffer]);
        this.lastUpdateTime = now;
      }
    }

    this.animationFrameRef = requestAnimationFrame(this.draw);
  };

  readonly mode = input<VisualizerMode>('bars');

  readonly barsConfig = input<FrequencyBarsConfig>({
    gap: 0,
    capHeight: 1,
    barCount: 24,
    capFalldown: 0.5
  });

  readonly oscConfig = input<OsciloscopeConfig>({ thickness: 2 });

  readonly colorConfig = input<VisualsColorConfig>({});

  readonly analyser = input<AnalyserNode>();

  readonly fftSize = input<number>();

  constructor() {
    const elr = inject<ElementRef<HTMLCanvasElement>>(ElementRef);

    this.canvas = elr.nativeElement;

    this.visualizerWorker = new Worker(new URL('visuals.worker', import.meta.url), { type: 'module' });
    this.visualizerWorker.addEventListener('message', this.handleWorkerMessage);

    const offscreenCanvas: OffscreenCanvas = this.canvas.transferControlToOffscreen();
    this.visualizerWorker.postMessage({ canvas: offscreenCanvas }, [offscreenCanvas]);

    this.resizeObserver = this.setupResizeObserver();
    effect(() => {
      const currentMode = this.mode();
      if (currentMode === 'off') {
        this.activeDataMethod = undefined;
        this.activeAnalyser = undefined;
        this.availableBuffers.length = 0;
        this.bufferSize = 0;
        this.stopVisualizer();
        return;
      }

      const barsConfig = this.barsConfig();
      const oscConfig = this.oscConfig();
      const colorConfig = this.colorConfig();
      const analyser = this.analyserNode;
      const fftSize = this.fftSize() ?? analyser.fftSize;
      const sampleRate = this.audioService.sampleRate();

      this.configureVisualizer(currentMode, analyser, fftSize, sampleRate, barsConfig, oscConfig, colorConfig);
    });
  }

  private setupResizeObserver() {
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      this.visualizerWorker.postMessage({
        newSize: rect
      });
    });
    observer.observe(this.canvas);
    return observer;
  }

  private get analyserNode(): AnalyserNode {
    const analyserValue = this.analyser();
    if (analyserValue) {
      return analyserValue;
    }
    if (!this._internalAnalyzer) {
      this._internalAnalyzer = this.audioService.plugInNewAnalyserNode();
    }
    return this._internalAnalyzer;
  }

  private configureVisualizer(
    mode: Exclude<VisualizerMode, 'off'>,
    analyser: AnalyserNode,
    fftSize: number,
    sampleRate: number,
    barsConfig: FrequencyBarsConfig,
    oscConfig: OsciloscopeConfig,
    colorConfig: VisualsColorConfig
  ): void {
    const isBars = mode === 'bars' || mode === 'circular-bars';
    const bufferSize = analyser.frequencyBinCount;
    if (bufferSize !== this.bufferSize) {
      this.bufferSize = bufferSize;
      this.availableBuffers.length = 0;
      for (let index = 0; index < 3; index++) {
        this.availableBuffers.push(new Uint8Array(bufferSize));
      }
    }

    this.activeAnalyser = analyser;
    this.activeDataMethod = isBars ? 'getByteFrequencyData' : 'getByteTimeDomainData';

    const baseOptions = {
      mode,
      mainColor: colorConfig.mainColor || FALLBACK_PRIMARY_COLOR,
      peakColor: colorConfig.peakColor || FALLBACK_ACCENT_COLOR,
      alpha: colorConfig.alpha ?? 1,
      bufferLength: bufferSize
    };
    let visualizerOptions: VisualizerOptions;
    if (mode === 'bars' || mode === 'circular-bars') {
      visualizerOptions = {
        ...baseOptions,
        mode,
        barCount: barsConfig.barCount,
        gap: barsConfig.gap,
        capHeight: barsConfig.capHeight,
        capFalldown: barsConfig.capFalldown,
        fftSize,
        sampleRate
      };
    } else {
      visualizerOptions = {
        ...baseOptions,
        mode,
        thickness: oscConfig.thickness
      };
    }

    this.visualizerWorker.postMessage({ visualizerOptions });
    if (this.animationFrameRef !== undefined) {
      return;
    }

    this.lastUpdateTime = 0;
    this.draw();
  }

  private stopVisualizer(): void {
    this.visualizerWorker.postMessage({ stop: true });
    if (this.animationFrameRef === undefined) {
      return;
    }

    cancelAnimationFrame(this.animationFrameRef);
    this.animationFrameRef = undefined;
  }

  ngOnDestroy(): void {
    this.stopVisualizer();
    this.resizeObserver.disconnect();
    this.visualizerWorker.removeEventListener('message', this.handleWorkerMessage);

    // Disconnect internal analyzer if it exists
    if (this._internalAnalyzer) {
      this.audioService.disconnectAnalyserNode(this._internalAnalyzer);
    }

    this.visualizerWorker.terminate();
  }
}
