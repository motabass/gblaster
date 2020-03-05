import { Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { scalePow } from 'd3';
import { FftSize, VisualizerMode } from './visuals.types';

@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy, OnChanges {
  // @HostBinding('style.display') display = 'none';

  @Input('mtbVisual')
  analyser?: AnalyserNode;

  // private _active = false;
  //
  // @Input()
  // set active(active: boolean) {
  //   this._active = active;
  //   if (this._active) {
  //     this.display = 'initial';
  //   } else {
  //     this.display = 'none';
  //   }
  // }

  @Input()
  mode: VisualizerMode = 'bars';

  @Input()
  barCount = 64;
  @Input()
  capHeight = 2;
  @Input()
  gap = 0;
  @Input()
  mainColor = '#000';
  @Input()
  peakColor = '#f00';
  @Input()
  fftSize: FftSize = 2048;
  @Input()
  smoothingTimeConstant = 0.5;
  @Input()
  minDecibels = -90;
  @Input()
  maxDecibels = 0;

  canvasCtx: CanvasRenderingContext2D | null;

  private animationFrameRef?: number;

  constructor(elr: ElementRef<HTMLCanvasElement>, private zone: NgZone) {
    const canvas: HTMLCanvasElement = elr.nativeElement;

    this.canvasCtx = canvas.getContext('2d');
  }

  ngOnChanges(changes: SimpleChanges) {
    this.stopVisualizer();
    switch (this.mode) {
      case 'osc':
        this.visualizeOscilloscope();
        break;
      case 'bars':
        this.visualizeFrequencyBars();
        break;
    }
  }

  visualizeFrequencyBars() {
    this.zone.runOutsideAngular(() => {
      const capYPositionArray: number[] = []; // store the vertical position of hte caps for the preivous frame

      const analyser = this.analyser;

      if (!analyser) {
        return;
      }

      analyser.fftSize = this.fftSize;
      analyser.minDecibels = this.minDecibels;
      analyser.maxDecibels = this.maxDecibels;
      analyser.smoothingTimeConstant = this.smoothingTimeConstant;

      const meterNum = this.barCount;
      const gap = this.gap; // gap between meters
      const capHeight = this.capHeight; // cap thickness
      const capStyle = this.mainColor;

      const canvasCtx = this.canvasCtx;

      if (!canvasCtx) {
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const analyserData = new Uint8Array(bufferLength);

      const canvasWidth = canvasCtx.canvas.width;
      const canvasHeight = canvasCtx.canvas.height;
      const barWidth = canvasWidth / meterNum - gap;

      const scale = scalePow()
        .exponent(1.6)
        .domain([0, meterNum])
        .range([0, bufferLength - bufferLength / 3]);

      const draw = () => {
        analyser.getByteFrequencyData(analyserData);

        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        const gradient = canvasCtx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(1, this.mainColor);
        gradient.addColorStop(0.3, this.mainColor);
        gradient.addColorStop(0, this.peakColor);

        for (let i = 0; i < meterNum; i++) {
          const position = Math.floor(scale(i));
          let value = analyserData[position];

          if (value > canvasHeight) {
            value = canvasHeight;
          }

          if (capYPositionArray.length < Math.round(meterNum)) {
            capYPositionArray.push(value);
          }

          canvasCtx.fillStyle = capStyle;
          // draw the cap, with transition effect
          if (value < capYPositionArray[i]) {
            canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - --capYPositionArray[i], barWidth, capHeight);
          } else {
            canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value, barWidth, capHeight);
            capYPositionArray[i] = value;
          }
          canvasCtx.fillStyle = gradient; // set the fillStyle to gradient for a better look

          canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value + capHeight, barWidth, value - capHeight); // the meter
        }

        this.animationFrameRef = requestAnimationFrame(draw);
      };

      this.animationFrameRef = requestAnimationFrame(draw);
    });
  }

  visualizeOscilloscope() {
    this.zone.runOutsideAngular(() => {
      const analyser = this.analyser;
      if (!analyser) {
        return;
      }

      analyser.fftSize = this.fftSize;
      analyser.minDecibels = this.minDecibels;
      analyser.maxDecibels = this.maxDecibels;
      analyser.smoothingTimeConstant = this.smoothingTimeConstant;

      const canvasCtx = this.canvasCtx;

      if (!canvasCtx) {
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const analyserData = new Uint8Array(bufferLength);

      const canvasWidth = canvasCtx.canvas.width;
      const canvasHeight = canvasCtx.canvas.height;

      const draw = () => {
        this.animationFrameRef = requestAnimationFrame(draw);

        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        analyser.getByteTimeDomainData(analyserData);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = this.mainColor;
        canvasCtx.beginPath();

        const sliceWidth = canvasWidth / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = analyserData[i] / 128.0;
          const y = (v * canvasHeight) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.stroke();
      };

      this.animationFrameRef = requestAnimationFrame(draw);
    });
  }

  stopVisualizer() {
    if (this.canvasCtx) {
      this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
    }

    if (this.animationFrameRef !== undefined) {
      cancelAnimationFrame(this.animationFrameRef);
    }
  }

  ngOnDestroy() {
    this.stopVisualizer();
  }
}
