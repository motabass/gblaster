import { Directive, ElementRef, Input, NgZone, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { scalePow } from 'd3';
import { FrequencyBarsConfig, OsciloscopeConfig, VisualizerMode, VisualsColorConfig } from './visuals.types';

@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy, OnChanges {
  @Input('mtbVisual')
  analyser?: AnalyserNode;

  @Input()
  mode: VisualizerMode = 'bars';

  @Input()
  barsConfig: FrequencyBarsConfig = { gap: 0, capHeight: 1, barCount: 24, capFalldown: 0.5 };

  @Input()
  oscConfig: OsciloscopeConfig = { thickness: 2 };

  @Input()
  colorConfig: VisualsColorConfig = { mainColor: 'red', peakColor: 'yellow' };

  canvasCtx: CanvasRenderingContext2D | null;

  private animationFrameRef?: number;

  constructor(elr: ElementRef<HTMLCanvasElement>, private zone: NgZone) {
    const canvas: HTMLCanvasElement = elr.nativeElement;

    this.canvasCtx = canvas.getContext('2d');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    this.stopVisualizer();
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
    this.zone.runOutsideAngular(() => {
      const capYPositionArray: number[] = []; // store the vertical position of hte caps for the preivous frame

      const analyser = this.analyser;

      if (!analyser) {
        return;
      }

      const meterNum = this.barsConfig.barCount;
      const gap = this.barsConfig.gap; // gap between meters
      const capHeight = this.barsConfig.capHeight; // cap thickness
      const capStyle = this.colorConfig.mainColor;

      const canvasCtx = this.canvasCtx;

      if (!canvasCtx) {
        return;
      }

      // DPI fix
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasCtx.canvas.getBoundingClientRect();
      canvasCtx.canvas.width = rect.width * dpr;
      canvasCtx.canvas.height = rect.height * dpr;
      canvasCtx.scale(dpr, dpr);

      const bufferLength = analyser.frequencyBinCount;
      const analyserData = new Uint8Array(bufferLength);

      const canvasWidth = canvasCtx.canvas.width;
      const canvasHeight = canvasCtx.canvas.height;
      const barWidth = canvasWidth / meterNum - gap;

      const frequencyCorrectionScale = scalePow()
        .exponent(2.5)
        .domain([-7, meterNum + 5])
        .range([0, bufferLength - bufferLength / 3]);

      const amplitudeScale = scalePow()
        .exponent(1.7)
        .domain([0, 255])
        .range([0, canvasHeight]);

      const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(1, this.colorConfig.mainColor);
      gradient.addColorStop(0.7, this.colorConfig.peakColor);
      gradient.addColorStop(0, this.colorConfig.peakColor);

      const draw = () => {
        analyser.getByteFrequencyData(analyserData);

        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0; i < meterNum; i++) {
          const position = Math.round(frequencyCorrectionScale(i));
          let value = analyserData[position];
          value = amplitudeScale(value);

          if (value > canvasHeight) {
            value = canvasHeight;
          }

          if (capYPositionArray.length < Math.round(meterNum)) {
            capYPositionArray.push(value);
          }

          canvasCtx.fillStyle = capStyle;
          // draw the cap, with transition effect
          if (value < capYPositionArray[i]) {
            canvasCtx.fillRect((barWidth + gap) * i, canvasHeight - capYPositionArray[i], barWidth, capHeight);
            if (capYPositionArray[i] > capHeight) {
              capYPositionArray[i] = capYPositionArray[i] - this.barsConfig.capFalldown;
            }
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

        canvasCtx.lineWidth = this.oscConfig.thickness;
        canvasCtx.strokeStyle = this.colorConfig.mainColor;
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
