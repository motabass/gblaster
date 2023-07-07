import { Directive, ElementRef, Input, NgZone, numberAttribute, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FrequencyBarsConfig, OsciloscopeConfig, VisualizerMode, VisualsColorConfig, VisualsWorkerMessage } from './visuals.types';

const FALLBACK_PRIMARY_COLOR = '#424242';
const FALLBACK_ACCENT_COLOR = '#bcbcbc';
@Directive({
  selector: '[mtbVisual]',
  standalone: true
})
export class VisualsDirective implements OnDestroy, OnChanges {
  @Input('mtbVisual') analyser!: AnalyserNode;

  @Input() mode: VisualizerMode = 'bars';

  @Input() barsConfig: FrequencyBarsConfig = { gap: 0, capHeight: 1, barCount: 24, capFalldown: 0.5 };

  @Input() oscConfig: OsciloscopeConfig = { thickness: 2 };

  @Input() colorConfig: VisualsColorConfig | null = {};

  @Input({ transform: numberAttribute }) sampleRate!: number;

  canvas: HTMLCanvasElement;

  private animationFrameRef?: number;

  private worker: Worker;

  constructor(
    elr: ElementRef<HTMLCanvasElement>,
    private zone: NgZone
  ) {
    this.canvas = elr.nativeElement;

    const offscreenCanvas: OffscreenCanvas = this.canvas.transferControlToOffscreen();

    this.worker = new Worker(new URL('./visuals.worker', import.meta.url), { type: 'module' });
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

    switch (this.mode) {
      case 'bars':
        this.visualizeFrequencyBars();
        break;
      case 'osc':
        this.visualizeOscilloscope();
        break;
    }
  }

  visualizeFrequencyBars() {
    this.worker.postMessage({
      visualizerOptions: {
        mode: 'bars',
        barCount: this.barsConfig.barCount,
        gap: this.barsConfig.gap,
        capHeight: this.barsConfig.capHeight,
        capFalldown: this.barsConfig.capFalldown,
        mainColor: this.colorConfig?.mainColor || FALLBACK_PRIMARY_COLOR,
        peakColor: this.colorConfig?.peakColor || FALLBACK_ACCENT_COLOR,
        alpha: this.colorConfig?.alpha ?? 1,
        bufferLength: this.analyser.frequencyBinCount,
        fftSize: this.analyser.fftSize,
        sampleRate: this.sampleRate
      }
    } as VisualsWorkerMessage);

    this.zone.runOutsideAngular(() => {
      const bufferLength = this.analyser.frequencyBinCount;
      const analyserData = new Uint8Array(bufferLength);

      const draw = () => {
        this.analyser.getByteFrequencyData(analyserData);
        this.worker.postMessage({ analyserData: analyserData } as VisualsWorkerMessage);

        this.animationFrameRef = requestAnimationFrame(draw);
      };
      draw();
    });
  }

  visualizeOscilloscope() {
    this.worker.postMessage({
      visualizerOptions: {
        mode: 'osc',
        mainColor: this.colorConfig?.mainColor || FALLBACK_PRIMARY_COLOR,
        peakColor: this.colorConfig?.peakColor || FALLBACK_ACCENT_COLOR,
        alpha: this.colorConfig?.alpha ?? 1,
        bufferLength: this.analyser.frequencyBinCount,
        thickness: this.oscConfig.thickness
      }
    } as VisualsWorkerMessage);

    this.zone.runOutsideAngular(() => {
      const bufferLength = this.analyser.frequencyBinCount;
      const analyserData = new Uint8Array(bufferLength);

      const draw = () => {
        this.analyser.getByteTimeDomainData(analyserData);
        this.worker.postMessage({ analyserData: analyserData } as VisualsWorkerMessage);
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
