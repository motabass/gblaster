import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { AudioService, FREQUENCY_BANDS } from '../audio.service';
import { BandPipe } from './band.pipe';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'mtb-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrl: './equalizer.component.scss',
  imports: [MatSliderModule, BandPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class EqualizerComponent {
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('eqCanvas');

  audioService = inject(AudioService);
  BANDS = FREQUENCY_BANDS;

  constructor() {
    // React to changes in equalizer values
    effect(() => {
      const data = this.audioService.equalizerGainValues(); // Track the signal
      this.drawEqualizerResponse();
    });
  }

  displayFunction(value: number): string {
    const numberValue = value.toFixed(1);
    return numberValue + ' dB';
  }

  drawEqualizerResponse(): void {
    if (!this.canvasRef()) return;

    const canvas = this.canvasRef()!.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1;

    // Horizontal grid lines (every 3dB)
    for (let db = -12; db <= 12; db += 3) {
      const y = height / 2 - (db * height) / 24;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw center line (0dB)
    ctx.strokeStyle = '#bbbbbb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Get current equalizer values
    const eqValues = this.audioService.equalizerGainValues();

    // Draw frequency response curve
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 3;
    ctx.beginPath();

    // Calculate logarithmic x-position for each frequency
    const minFreq = 20;
    const maxFreq = 20000;
    const getXPos = (freq: number) => {
      return ((Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq))) * width;
    };

    // Draw smooth curve between points
    const freqPoints: { x: number; y: number }[] = [];

    // Start with the lowest frequency
    freqPoints.push({
      x: 0,
      y: height / 2 - (eqValues[this.BANDS[0]] * height) / 24
    });

    // Draw points for each frequency band
    for (const freq of this.BANDS) {
      const x = getXPos(freq);
      const y = height / 2 - (eqValues[freq] * height) / 24;
      freqPoints.push({ x, y });
    }

    // End with the highest frequency
    freqPoints.push({
      x: width,
      y: height / 2 - (eqValues[this.BANDS.at(-1)!] * height) / 24
    });

    // Draw curve through points
    ctx.beginPath();
    ctx.moveTo(freqPoints[0].x, freqPoints[0].y);

    for (let i = 0; i < freqPoints.length - 1; i++) {
      const xc = (freqPoints[i].x + freqPoints[i + 1].x) / 2;
      const yc = (freqPoints[i].y + freqPoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(freqPoints[i].x, freqPoints[i].y, xc, yc);
    }

    ctx.quadraticCurveTo(freqPoints.at(-1)!.x, freqPoints.at(-1)!.y, freqPoints.at(-1)!.x, freqPoints.at(-1)!.y);

    ctx.stroke();

    // Draw frequency labels
    ctx.fillStyle = '#666666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';

    const labelFreqs = [30, 100, 300, 1000, 3000, 10000, 20000];
    for (const freq of labelFreqs) {
      const x = getXPos(freq);
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillText(label, x, height - 5);
    }
  }
}
