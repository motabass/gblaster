import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy, OnInit {
  private readonly canvasCtx: CanvasRenderingContext2D;

  idle = true;

  @Input('mtbVisual')
  analyser: AnalyserNode;

  @Input()
  meterNum = 64;

  @Input()
  dimmFactor = 24;

  @Input()
  mainColor = '#000';

  @Input()
  peakColor = '#f00';

  private capYPositionArray = []; // store the vertical position of hte caps for the preivous frame

  private animationFrameRef: number;

  constructor(elr: ElementRef<HTMLCanvasElement>) {
    this.canvasCtx = elr.nativeElement.getContext('2d');
  }

  ngOnInit() {
    this.visualize();
  }

  visualize() {
    const analyser = this.analyser;

    analyser.fftSize = 512;
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.8;

    const meterNum = this.meterNum;

    const upperCutoff = 86;

    const canvasCtx = this.canvasCtx;

    const uint8Array = new Uint8Array(analyser.frequencyBinCount - upperCutoff);

    const cwidth = canvasCtx.canvas.width;
    const cheight = canvasCtx.canvas.height;
    const dimmFactor = this.dimmFactor;
    const gap = 0; // gap between meters

    const barWidth = cwidth / meterNum - gap;
    const capHeight = 2; // cap thickness
    const capStyle = this.mainColor;

    const step = uint8Array.length / meterNum; // sample limited data from the total array
    const steps: number[] = [];
    let stepFaktor = 0;
    for (let m = 0; m < meterNum; m++) {
      const arrayPos = Math.round(step * m * stepFaktor);
      stepFaktor += 1 / meterNum;
      steps.push(arrayPos);
    }

    const draw = () => {
      analyser.getByteFrequencyData(uint8Array);

      let hasData: boolean;
      for (let i = 0; i < uint8Array.length; i += 10) {
        if (uint8Array[i]) {
          hasData = true;
          break;
        }
      }

      if (hasData) {
        this.idle = false;
        canvasCtx.clearRect(0, 0, cwidth, cheight);
        const gradient = canvasCtx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(1, this.mainColor);
        gradient.addColorStop(0.3, this.mainColor);
        gradient.addColorStop(0, this.peakColor);

        for (let i = 0; i < meterNum; i++) {
          let value = uint8Array[steps[i]] - dimmFactor;

          if (value > cheight) {
            value = cheight;
          }

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
      } else if (!this.idle) {
        canvasCtx.clearRect(0, 0, cwidth, cheight);
        this.idle = true;
      }

      requestAnimationFrame(draw);
    };

    this.animationFrameRef = requestAnimationFrame(draw);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameRef);
  }
}
