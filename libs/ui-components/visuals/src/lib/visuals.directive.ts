import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { VisualsService } from './visuals.service';

@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy, OnInit {
  canvasCtx: CanvasRenderingContext2D;

  mainColor = '#000';
  peakColor = '#f00';

  capYPositionArray = []; // store the vertical position of hte caps for the preivous frame

  animationFrameRef: number;

  constructor(elr: ElementRef<HTMLCanvasElement>, private visualsService: VisualsService) {
    this.canvasCtx = elr.nativeElement.getContext('2d');
  }

  ngOnInit() {
    this.visualsService.analyserSubject.asObservable().subscribe((analyser) => {
      if (analyser) {
        this.visualize(analyser);
      }
    });
  }

  visualize(analyser: AnalyserNode) {
    if (this.animationFrameRef) {
      cancelAnimationFrame(this.animationFrameRef);
    }

    const meterNum = 64;

    const upperCutoff = 86;

    const canvasCtx = this.canvasCtx;

    const uint8Array = new Uint8Array(analyser.frequencyBinCount - upperCutoff);

    const cwidth = canvasCtx.canvas.width;
    const cheight = canvasCtx.canvas.height;
    const dimmFactor = 32; // gap between meters
    const gap = 0; // gap between meters

    const barWidth = cwidth / meterNum - gap;
    const capHeight = 2; // cap thickness
    const capStyle = this.mainColor;

    const step = uint8Array.length / meterNum; // sample limited data from the total array

    const draw = () => {
      analyser.getByteFrequencyData(uint8Array);

      const gradient = canvasCtx.createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(1, this.mainColor);
      gradient.addColorStop(0.3, this.mainColor);
      gradient.addColorStop(0, this.peakColor);

      canvasCtx.clearRect(0, 0, cwidth, cheight);
      for (let i = 0; i < meterNum; i++) {
        const roundedStep = Math.round(i * step);
        const value = uint8Array[roundedStep] - dimmFactor;

        if (this.capYPositionArray.length < Math.round(meterNum)) {
          this.capYPositionArray.push(value);
        }
        canvasCtx.fillStyle = capStyle;
        // draw the cap, with transition effect
        if (value < this.capYPositionArray[i]) {
          if (i < 6) {
            canvasCtx.fillRect((barWidth + gap) * i, cheight - --this.capYPositionArray[i] + 60 / (i + 1), barWidth, capHeight);
          } else {
            canvasCtx.fillRect((barWidth + gap) * i, cheight - --this.capYPositionArray[i], barWidth, capHeight);
          }
        } else {
          if (i < 6) {
            canvasCtx.fillRect((barWidth + gap) * i, cheight - value + 60 / (i + 1), barWidth, capHeight);
          } else {
            canvasCtx.fillRect((barWidth + gap) * i, cheight - value, barWidth, capHeight);
          }
          this.capYPositionArray[i] = value;
        }
        canvasCtx.fillStyle = gradient; // set the fillStyle to gradient for a better look

        if (i < 6) {
          canvasCtx.fillRect((barWidth + gap) * i, cheight - value + capHeight + 60 / (i + 1), barWidth, value - capHeight); // the meter
        } else {
          canvasCtx.fillRect((barWidth + gap) * i, cheight - value + capHeight, barWidth, value - capHeight); // the meter
        }
      }
      requestAnimationFrame(draw);
    };

    draw();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameRef);
  }
}
