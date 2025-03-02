import { Directive, ElementRef, inject, input, NgZone, numberAttribute, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import type { FrequencyBarsConfig, OsciloscopeConfig, VisualizerMode, VisualsColorConfig, VisualsWorkerMessage } from './visuals.types';

const FALLBACK_PRIMARY_COLOR = '#424242';
const FALLBACK_ACCENT_COLOR = '#bcbcbc';
@Directive({
  selector: '[mtbVisual]',
  standalone: true
})
export class VisualsDirective implements OnDestroy, OnChanges {
  private zone = inject(NgZone);

  readonly analyser = input.required<AnalyserNode>({ alias: 'mtbVisual' });

  readonly mode = input<VisualizerMode>('bars');

  readonly barsConfig = input<FrequencyBarsConfig>({ gap: 0, capHeight: 1, barCount: 24, capFalldown: 0.5 });

  readonly oscConfig = input<OsciloscopeConfig>({ thickness: 2 });

  readonly colorConfig = input<VisualsColorConfig | null>({});

  readonly sampleRate = input.required<number, unknown>({ transform: numberAttribute });

  canvas: HTMLCanvasElement;

  private animationFrameRef?: number;

  private worker: Worker;

  private analyserData!: Uint8Array;

  constructor() {
    const elr = inject<ElementRef<HTMLCanvasElement>>(ElementRef);

    this.canvas = elr.nativeElement;

    const offscreenCanvas: OffscreenCanvas = this.canvas.transferControlToOffscreen();

    this.worker = new Worker(new URL('visuals.worker', import.meta.url), { type: 'module' });
    // this.worker.onmessage = ({ data }) => {
    //   console.log(`page got message: ${data}`);
    // };

    this.worker.postMessage({ canvas: offscreenCanvas } as VisualsWorkerMessage, [offscreenCanvas]);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.stopVisualizer();

    // give canvas size for correct dpi
    const rect = this.canvas.getBoundingClientRect();

    this.worker.postMessage({ newSize: rect } as VisualsWorkerMessage);

    switch (this.mode()) {
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
  }

  visualizeFrequencyBars(circular: boolean) {
    this.worker.postMessage({
      visualizerOptions: {
        mode: circular ? 'circular-bars' : 'bars',
        barCount: this.barsConfig().barCount,
        gap: this.barsConfig().gap,
        capHeight: this.barsConfig().capHeight,
        capFalldown: this.barsConfig().capFalldown,
        mainColor: this.colorConfig()?.mainColor || FALLBACK_PRIMARY_COLOR,
        peakColor: this.colorConfig()?.peakColor || FALLBACK_ACCENT_COLOR,
        alpha: this.colorConfig()?.alpha ?? 1,
        bufferLength: this.analyser().frequencyBinCount,
        fftSize: this.analyser().fftSize,
        sampleRate: this.sampleRate()
      }
    } as VisualsWorkerMessage);

    this.zone.runOutsideAngular(() => {
      if (!this.analyserData) {
        this.analyserData = new Uint8Array(this.analyser().frequencyBinCount);
      }
      const draw = () => {
        this.analyser().getByteFrequencyData(this.analyserData);
        this.worker.postMessage({ analyserData: this.analyserData } as VisualsWorkerMessage);

        this.animationFrameRef = requestAnimationFrame(draw);
      };
      draw();
    });
  }

  visualizeOscilloscope(circular: boolean) {
    this.worker.postMessage({
      visualizerOptions: {
        mode: circular ? 'circular-osc' : 'osc',
        mainColor: this.colorConfig()?.mainColor || FALLBACK_PRIMARY_COLOR,
        peakColor: this.colorConfig()?.peakColor || FALLBACK_ACCENT_COLOR,
        alpha: this.colorConfig()?.alpha ?? 1,
        bufferLength: this.analyser().frequencyBinCount,
        thickness: this.oscConfig().thickness
      }
    } as VisualsWorkerMessage);

    this.zone.runOutsideAngular(() => {
      if (!this.analyserData) {
        this.analyserData = new Uint8Array(this.analyser().frequencyBinCount);
      }
      const draw = () => {
        this.analyser().getByteTimeDomainData(this.analyserData);
        this.worker.postMessage({ analyserData: this.analyserData } as VisualsWorkerMessage);
        this.animationFrameRef = requestAnimationFrame(draw);
      };
      draw();
    });
  }

  stopVisualizer() {
    this.worker.postMessage({ stop: true } as VisualsWorkerMessage);
    if (this.animationFrameRef !== undefined) {
      cancelAnimationFrame(this.animationFrameRef);
    }
  }

  ngOnDestroy() {
    this.stopVisualizer();
    this.worker.terminate();
  }
}
