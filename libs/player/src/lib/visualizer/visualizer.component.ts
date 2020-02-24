import { Component } from '@angular/core';
import { VisualizerMode } from '@motabass/ui-components/visuals';
import { PlayerService } from '../player.service';

@Component({
  selector: 'mtb-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent {
  visualMode: VisualizerMode = 'bars';

  smoothing = 0.7;
  minDb = -75;
  maxDb = 24;
  barCount = 48;
  fftSize = 2048;
  capHeight = 2;
  gap = 0;

  constructor(private playerService: PlayerService) {}

  toggleVisualMode() {
    this.visualMode === 'bars' ? (this.visualMode = 'osc') : (this.visualMode = 'bars');
  }

  get analyser(): AnalyserNode {
    return this.playerService.analyser;
  }

  setSmoothing(value: number) {
    this.smoothing = value;
  }

  setMinDb(value: number) {
    this.minDb = value;
  }

  setMaxDb(value: number) {
    this.maxDb = value;
  }

  setBarCount(value: number) {
    this.barCount = value;
  }

  setCapHeight(value: number) {
    this.capHeight = value;
  }

  setGap(value: number) {
    this.gap = value;
  }

  setFftSize(value: number | string) {
    this.fftSize = Number(value);
  }

  get fftOptions(): number[] {
    const options: number[] = [];
    for (let i = 32; i <= 32768; i *= 2) {
      options.push(i);
    }
    return options;
  }
}
