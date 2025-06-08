import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { AudioService } from '../audio.service';
import { MatSliderModule } from '@angular/material/slider';
import { FREQUENCY_BANDS } from '../player.types';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'mtb-equalizer',
  imports: [MatSliderModule],
  templateUrl: './equalizer.component.html',
  styleUrl: './equalizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class EqualizerComponent {
  audioService = inject(AudioService);
  themeService = inject(ThemeService);
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('eqCanvas');

  BANDS = FREQUENCY_BANDS;

  constructor() {
    // React to changes in equalizer values
    effect(() => {
      this.audioService.equalizerGainValues(); // Track the signal
      this.audioService.baseGain(); // Track gain changes
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

    // Draw grid lines
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 0.2;

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
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Get current equalizer values and gain
    const eqValues = this.audioService.equalizerGainValues();
    const gainValue = this.audioService.baseGain();

    // Calculate logarithmic x-position for each frequency
    const minFreq = 20;
    const maxFreq = 20_000;
    const getXPos = (freq: number) => {
      return ((Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq))) * width;
    };

    // Draw frequency response curve with gain applied
    ctx.strokeStyle = this.themeService.primaryColor;
    ctx.lineWidth = 3;

    const freqPoints: { x: number; y: number }[] = [];

    // Start with the lowest frequency
    freqPoints.push({
      x: 0,
      y: height / 2 - ((eqValues[this.BANDS[0]] + (gainValue - 1) * 12) * height) / 24
    });

    // Draw points for each frequency band with gain applied
    for (const freq of this.BANDS) {
      const x = getXPos(freq);
      // Apply gain influence to the curve
      const y = height / 2 - ((eqValues[freq] + (gainValue - 1) * 12) * height) / 24;
      freqPoints.push({ x, y });
    }

    // End with the highest frequency
    freqPoints.push({
      x: width,
      y: height / 2 - ((eqValues[this.BANDS.at(-1)!] + (gainValue - 1) * 12) * height) / 24
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

    const labelFreqs = this.BANDS.filter((freq) => freq >= minFreq && freq <= maxFreq);
    for (const freq of labelFreqs) {
      const x = getXPos(freq);
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillText(label, x, height - 5);
    }

    // Display gain value
    ctx.fillStyle = this.themeService.accentColor;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Gain: ${gainValue.toFixed(1)}x`, width - 10, 20);
  }
}
