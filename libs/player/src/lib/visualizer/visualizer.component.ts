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

  setSmoothing(value: number | null) {
    if (!value) {
      return;
    }
    this.smoothing = value;
  }

  setMinDb(value: number | null) {
    if (!value) {
      return;
    }
    this.minDb = value;
  }

  setMaxDb(value: number | null) {
    if (!value) {
      return;
    }
    this.maxDb = value;
  }

  setBarCount(value: number | null) {
    if (!value) {
      return;
    }
    this.barCount = value;
  }

  setCapHeight(value: number | null) {
    if (!value) {
      return;
    }
    this.capHeight = value;
  }

  setGap(value: number | null) {
    if (!value) {
      return;
    }
    this.gap = value;
  }

  setFftSize(value: number | null) {
    if (!value) {
      return;
    }
    this.fftSize = value;
  }

  get fftOptions(): number[] {
    const options: number[] = [];
    for (let i = 32; i <= 32768; i *= 2) {
      options.push(i);
    }
    return options;
  }
}
