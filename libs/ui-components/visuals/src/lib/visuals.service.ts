import { Injectable, NgZone, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VisualsService implements OnDestroy {
  private _analyser: AnalyserNode;

  capYPositionArray = []; // store the vertical position of hte caps for the preivous frame

  mainColor = '#000';
  peakColor = '#f00';

  zoneRef: number;

  _canvasRef: HTMLCanvasElement;

  constructor(private zone: NgZone) {
  }

  set canvas(canvas: HTMLCanvasElement) {
    this._canvasRef = canvas;

  }

  visualize(analyser: AnalyserNode) {
    this.zoneRef = this.zone.runOutsideAngular(() => {
      const bufferLength = analyser.frequencyBinCount;
      const array = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(array);

      const canvas = this._canvasRef;

      const cwidth = canvas.width;
      const cheight = canvas.height;
      const barWidth = (cwidth / bufferLength) * 4;
      const gap = 1; // gap between meters
      const capHeight = 2;
      const capStyle = this.mainColor;
      const meterNum = bufferLength;
      const canvasCtx = canvas.getContext('2d');

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
      return window.requestAnimationFrame(this.visualize.bind(this));
    });
  }

  ngOnDestroy() {
    window.cancelAnimationFrame(this.zoneRef);
  }
}
