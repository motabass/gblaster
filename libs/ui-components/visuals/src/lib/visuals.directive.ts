import { Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FrequencyBarsConfig, OsciloscopeConfig, VisualizerMode, VisualsColorConfig } from './visuals.types';

@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy, OnChanges {
  @Input('mtbVisual')
  analyser?: any;

  @Input()
  mode: VisualizerMode = 'bars';

  @Input()
  barsConfig: FrequencyBarsConfig = { gap: 0, capHeight: 1, barCount: 24, capFalldown: 0.5 };

  @Input()
  oscConfig: OsciloscopeConfig = { thickness: 2 };

  @Input()
  colorConfig: VisualsColorConfig = { mainColor: 'red', peakColor: 'yellow' };

  canvas: HTMLCanvasElement;

  private animationFrameRef?: number;

  private worker: Worker;

  constructor(elr: ElementRef<HTMLCanvasElement>, private zone: NgZone) {
    this.canvas = elr.nativeElement;

    const offscreenCanvas: OffscreenCanvas = this.canvas.transferControlToOffscreen();

    this.worker = new Worker('./visuals.worker', { type: 'module' });
    this.worker.onmessage = ({ data }) => {
      console.log(`page got message: ${data}`);
    };

    // @ts-ignore
    this.worker.postMessage({ canvas: offscreenCanvas }, [offscreenCanvas]);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.stopVisualizer();

    // give canvas size for correct dpi
    const rect = this.canvas.getBoundingClientRect();

    this.worker.postMessage({ newSize: rect });

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
      start: true,
      mode: 'bars',
      barCount: this.barsConfig.barCount,
      gap: this.barsConfig.gap,
      capHeight: this.barsConfig.capHeight,
      capFalldown: this.barsConfig.capFalldown,
      mainColor: this.colorConfig.mainColor,
      peakColor: this.colorConfig.peakColor,
      bufferLength: this.analyser.frequencyBinCount
    });

    this.zone.runOutsideAngular(() => {
      const bufferLength = this.analyser.frequencyBinCount;
      const analyserData = new Uint8Array(bufferLength);

      const draw = () => {
        this.analyser.getByteFrequencyData(analyserData);
        this.worker.postMessage({ analyserData: analyserData });
        this.animationFrameRef = requestAnimationFrame(draw);
      };

      this.animationFrameRef = requestAnimationFrame(draw);
    });
  }

  visualizeOscilloscope() {
    this.worker.postMessage({
      start: true,
      mode: 'osc',
      mainColor: this.colorConfig.mainColor,
      peakColor: this.colorConfig.peakColor,
      bufferLength: this.analyser.frequencyBinCount,
      thickness: this.oscConfig.thickness
    });

    this.zone.runOutsideAngular(() => {
      const bufferLength = this.analyser.frequencyBinCount;
      const analyserData = new Uint8Array(bufferLength);

      const draw = () => {
        this.analyser.getByteTimeDomainData(analyserData);
        this.worker.postMessage({ analyserData: analyserData });
        this.animationFrameRef = requestAnimationFrame(draw);
      };

      this.animationFrameRef = requestAnimationFrame(draw);
    });
  }

  stopVisualizer() {
    this.worker.postMessage({ stop: true });
    if (this.animationFrameRef !== undefined) {
      cancelAnimationFrame(this.animationFrameRef);
    }
  }

  ngOnDestroy() {
    this.stopVisualizer();
    this.worker.terminate();
  }
}
