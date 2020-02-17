import { Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VisualsService implements OnDestroy {
  mainColor = '#000';

  peakColor = '#f00';

  canvasCtx: CanvasRenderingContext2D;
  analyser: AnalyserNode;

  capYPositionArray = []; // store the vertical position of hte caps for the preivous frame

  animationFrameRef: number;

  constructor() {}

  setCanvasContext(canvasCtx: CanvasRenderingContext2D) {
    this.canvasCtx = canvasCtx;
  }

  setAnalyser(analyser: AnalyserNode) {
    this.analyser = analyser;
  }

  visualize(newAnalyser?: AnalyserNode) {
    if (this.animationFrameRef) {
      cancelAnimationFrame(this.animationFrameRef);
    }
    if (newAnalyser) {
      this.analyser = newAnalyser;
    }
    const canvasCtx = this.canvasCtx;
    const analyser = this.analyser;
    const bufferLength = analyser.frequencyBinCount;

    const array = new Uint8Array(bufferLength);

    const cwidth = canvasCtx.canvas.width;
    const cheight = canvasCtx.canvas.height;
    const barWidth = (cwidth / bufferLength) * 4;
    const gap = 1; // gap between meters
    const capHeight = 2;
    const capStyle = this.mainColor;
    const meterNum = bufferLength;

    const draw = () => {
      analyser.getByteFrequencyData(array);
      // console.log(array);

      const gradient = canvasCtx.createLinearGradient(0, 0, 0, 500);
      gradient.addColorStop(1, this.mainColor);
      gradient.addColorStop(0.2, this.mainColor);
      gradient.addColorStop(0, this.peakColor);

      let step = Math.round(array.length / meterNum) - 1; // sample limited data from the total array

      canvasCtx.clearRect(0, 0, cwidth, cheight);
      for (let i = 0; i < meterNum; i++) {
        const value = array[i + step];
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
        step += Math.round(i / 8);
      }
      requestAnimationFrame(draw);
    };

    draw();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameRef);
  }
}
