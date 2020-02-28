import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FftSize, VisualizerMode } from './visuals.types';

@Directive({
  selector: '[mtbVisual]'
})
export class VisualsDirective implements OnDestroy, OnChanges {
  idle = true;

  @Input('mtbVisual')
  analyser?: AnalyserNode;

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

  canvasCtx: ImageBitmapRenderingContext | null;

  private capYPositionArray: number[] = []; // store the vertical position of hte caps for the preivous frame

  private animationFrameRef?: number;

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

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    this.setAnalyserOptions();
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

  setAnalyserOptions() {
    const analyser = this.analyser;
    if (analyser) {
      analyser.fftSize = this.fftSize;
      analyser.minDecibels = this.minDecibels;
      analyser.maxDecibels = this.maxDecibels;
      analyser.smoothingTimeConstant = this.smoothingTimeConstant;
    }
  }

  visualizeFrequencyBars() {
    const analyser = this.analyser;

    if (!analyser) {
      return;
    }

    const meterNum = this.barCount;
    const gap = this.gap; // gap between meters
    const capHeight = this.capHeight; // cap thickness
    const capStyle = this.mainColor;

    const upperCutoff = this.fftSize / 4;

    const canvasCtx = this.canvasCtx;

    if (!canvasCtx) {
      return;
    }

    const bufferLength = analyser.frequencyBinCount - upperCutoff;
    const analyserData = new Uint8Array(bufferLength);

    const offscreenCanvas = new OffscreenCanvas(canvasCtx.canvas.width, canvasCtx.canvas.height);
    const offscreenCanvasCtx: OffscreenCanvasRenderingContext2D | null = offscreenCanvas.getContext('2d');

    if (!offscreenCanvasCtx) {
      return;
    }

    const canvasWidth = offscreenCanvas.width;
    const canvasHeight = offscreenCanvas.height;
    const barWidth = canvasWidth / meterNum - gap;

    const step = bufferLength / meterNum; // sample limited data from the total array
    const steps: number[] = [];
    let stepCorrection = 0;

    for (let m = 0; m < meterNum; m++) {
      const arrayPos = Math.round(step * m * stepCorrection);
      steps.push(arrayPos);
      stepCorrection += 1 / meterNum;
    }

    const draw = () => {
      this.animationFrameRef = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(analyserData);

      let hasData = false;
      for (let i = 0; i < analyserData.length; i += 10) {
        if (analyserData[i]) {
          hasData = true;
          break;
        }
      }

      if (hasData) {
        this.idle = false;
        offscreenCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        const gradient = offscreenCanvasCtx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(1, this.mainColor);
        gradient.addColorStop(0.3, this.mainColor);
        gradient.addColorStop(0, this.peakColor);

        for (let i = 0; i < meterNum; i++) {
          let value = analyserData[steps[i]];

          if (value > canvasHeight) {
            value = canvasHeight;
          }

          if (this.capYPositionArray.length < Math.round(meterNum)) {
            this.capYPositionArray.push(value);
          }
          offscreenCanvasCtx.fillStyle = capStyle;
          // draw the cap, with transition effect
          if (value < this.capYPositionArray[i]) {
            if (i < 6) {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, canvasHeight - --this.capYPositionArray[i] + 60 / (i + 1), barWidth, capHeight);
            } else {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, canvasHeight - --this.capYPositionArray[i], barWidth, capHeight);
            }
          } else {
            if (i < 6) {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value + 60 / (i + 1), barWidth, capHeight);
            } else {
              offscreenCanvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value, barWidth, capHeight);
            }
            this.capYPositionArray[i] = value;
          }
          offscreenCanvasCtx.fillStyle = gradient; // set the fillStyle to gradient for a better look

          if (i < 6) {
            offscreenCanvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value + capHeight + 60 / (i + 1), barWidth, value - capHeight); // the meter
          } else {
            offscreenCanvasCtx.fillRect((barWidth + gap) * i, canvasHeight - value + capHeight, barWidth, value - capHeight); // the meter
          }
        }

        const bitmap = offscreenCanvas.transferToImageBitmap();
        canvasCtx.transferFromImageBitmap(bitmap);
      } else if (!this.idle) {
        offscreenCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        const bitmap = offscreenCanvas.transferToImageBitmap();
        canvasCtx.transferFromImageBitmap(bitmap);
        this.idle = true;
      }
    };

    draw();
  }

  visualizeOscilloscope() {
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

    const offscreenCanvas = new OffscreenCanvas(canvasCtx.canvas.width, canvasCtx.canvas.height);
    const offscreenCanvasCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCanvasCtx) {
      return;
    }

    const canvasWidth = offscreenCanvas.width;
    const canvasHeight = offscreenCanvas.height;

    offscreenCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    const draw = () => {
      this.animationFrameRef = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(analyserData);

      offscreenCanvasCtx.lineWidth = 2;
      offscreenCanvasCtx.strokeStyle = this.mainColor;
      offscreenCanvasCtx.beginPath();

      const sliceWidth = canvasWidth / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = analyserData[i] / 128.0;
        const y = (v * canvasHeight) / 2;

        if (i === 0) {
          offscreenCanvasCtx.moveTo(x, y);
        } else {
          offscreenCanvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      // offscreenCanvasCtx.lineTo(canvasWidth, canvasHeight / 2);
      offscreenCanvasCtx.stroke();

      const bitmap = offscreenCanvas.transferToImageBitmap();
      canvasCtx.transferFromImageBitmap(bitmap);
    };

    draw();
  }

  stopVisualizer() {
    if (this.animationFrameRef !== undefined) {
      cancelAnimationFrame(this.animationFrameRef);
    }
  }

  ngOnDestroy() {
    this.stopVisualizer();
  }
}
