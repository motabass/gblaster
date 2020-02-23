import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy, OnInit {
  idle = true;

  @Input('mtbVisual')
  analyser: AnalyserNode;

  @Input()
  meterNum = 64;

  @Input()
  capHeight = 2;

  @Input()
  dimmFactor = 26;

  @Input()
  gap = 0;

  @Input()
  mainColor = '#000';

  @Input()
  peakColor = '#f00';

  canvasCtx: ImageBitmapRenderingContext;

  private capYPositionArray = []; // store the vertical position of hte caps for the preivous frame

  private animationFrameRef: number;

  constructor(elr: ElementRef<HTMLCanvasElement>) {
    const canvas: HTMLCanvasElement = elr.nativeElement;

    this.canvasCtx = canvas.getContext('bitmaprenderer');

    // tODO: try with offscreen canvas in worker (how to get analyserDatat to worker?)
    // const offscreen: OffscreenCanvas = canvas.transferControlToOffscreen();
    // const worker = new Worker('../../../../../apps/motabass/src/app/visuals-offscreen-canvas.worker', { type: 'module' });
    // worker.onmessage = ({ data }) => {
    //   console.log(`page got message: ${data}`);
    // };
    // // @ts-ignore
    // worker.postMessage({ canvas: offscreen }, [offscreen]);
    //
    // this.worker = worker;
  }

  ngOnInit() {
    this.visualize();
  }

  visualize() {
    const analyser = this.analyser;

    analyser.fftSize = 2048;
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.5;

    const meterNum = this.meterNum;
    const dimmFactor = this.dimmFactor;
    const gap = this.gap; // gap between meters
    const capHeight = this.capHeight; // cap thickness
    const capStyle = this.mainColor;

    const upperCutoff = 700;

    const canvasCtx = this.canvasCtx;

    const analyserData = new Uint8Array(analyser.frequencyBinCount - upperCutoff);

    const offscreenCanvas = new OffscreenCanvas(canvasCtx.canvas.width, canvasCtx.canvas.height);
    const offscreenCanvasCtx = offscreenCanvas.getContext('2d');

    const cwidth = offscreenCanvas.width;
    const cheight = offscreenCanvas.height;
    const barWidth = cwidth / meterNum - gap;

    const step = analyserData.length / meterNum; // sample limited data from the total array
    const steps: number[] = [];
    const dimValues: number[] = [];
    let stepCorrection = 0;
    let dimCorrection = 2.5;

    for (let m = 0; m < meterNum; m++) {
      const arrayPos = Math.round(step * m * stepCorrection);
      steps.push(arrayPos);
      dimValues.push(dimmFactor * dimCorrection);
      stepCorrection += 1 / meterNum;
      dimCorrection -= 1.5 / meterNum;
    }

    const draw = () => {
      analyser.getByteFrequencyData(analyserData);

      let hasData: boolean;
      for (let i = 0; i < analyserData.length; i += 10) {
        if (analyserData[i]) {
          hasData = true;
          break;
        }
      }

      if (hasData) {
        this.idle = false;
        offscreenCanvasCtx.clearRect(0, 0, cwidth, cheight);
        const gradient = offscreenCanvasCtx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(1, this.mainColor);
        gradient.addColorStop(0.3, this.mainColor);
        gradient.addColorStop(0, this.peakColor);

        for (let i = 0; i < meterNum; i++) {
          let value = analyserData[steps[i]] - dimValues[i];

          if (value > cheight) {
            value = cheight;
          }

          if (this.capYPositionArray.length < Math.round(meterNum)) {
            this.capYPositionArray.push(value);
          }
          offscreenCanvasCtx.fillStyle = capStyle;
          // draw the cap, with transition effect
          if (value < this.capYPositionArray[i]) {
            if (i < 6) {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, cheight - --this.capYPositionArray[i] + 60 / (i + 1), barWidth, capHeight);
            } else {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, cheight - --this.capYPositionArray[i], barWidth, capHeight);
            }
          } else {
            if (i < 6) {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, cheight - value + 60 / (i + 1), barWidth, capHeight);
            } else {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, cheight - value, barWidth, capHeight);
            }
            this.capYPositionArray[i] = value;
          }
          offscreenCanvasCtx.fillStyle = gradient; // set the fillStyle to gradient for a better look

          if (i < 6) {
            offscreenCanvasCtx.fillRect((barWidth + gap) * i, cheight - value + capHeight + 60 / (i + 1), barWidth, value - capHeight); // the meter
          } else {
            offscreenCanvasCtx.fillRect((barWidth + gap) * i, cheight - value + capHeight, barWidth, value - capHeight); // the meter
          }
        }

        const bitmap = offscreenCanvas.transferToImageBitmap();
        canvasCtx.transferFromImageBitmap(bitmap);
      } else if (!this.idle) {
        offscreenCanvasCtx.clearRect(0, 0, cwidth, cheight);
        const bitmap = offscreenCanvas.transferToImageBitmap();
        canvasCtx.transferFromImageBitmap(bitmap);
        this.idle = true;
      }

      this.animationFrameRef = requestAnimationFrame(draw);
    };

    this.animationFrameRef = requestAnimationFrame(draw);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameRef);
  }
}
