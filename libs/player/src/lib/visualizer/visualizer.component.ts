import { Component, OnDestroy, OnInit } from '@angular/core';
import { FftSize, VisualizerMode } from '@motabass/ui-components/visuals';
import { LocalStorage } from 'ngx-webstorage';
import { GamepadService } from '../gamepad.service';
import { GamepadButtons } from '../gamepad.types';
import { PlayerService } from '../player.service';

// TODO: local storage reset
// TODO: quit app + min + max buttons in electron

@Component({
  selector: 'mtb-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit, OnDestroy {
  @LocalStorage('visualMode', 'bars')
  visualMode!: VisualizerMode;

  @LocalStorage('smoothing', 0.7)
  smoothing!: number;

  @LocalStorage('minDb', -75)
  minDb!: number;

  @LocalStorage('maxDb', 24)
  maxDb!: number;

  @LocalStorage('barCount', 48)
  barCount!: number;

  @LocalStorage('fftSize', 4096)
  fftSize!: FftSize;

  @LocalStorage('capHeight', 2)
  capHeight!: number;

  @LocalStorage('gap', 0)
  gap!: number;

  constructor(private playerService: PlayerService, private gamepadService: GamepadService) {}

  ngOnInit(): void {
    this.gamepadService.registerButtonAction(GamepadButtons.SELECT_BUTTON, () => this.toggleVisualMode());
  }

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

  setFftSize(value: FftSize | null) {
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

  get mainColor(): string {
    const color = this.playerService.selectedSong?.metadata?.coverColors?.LightMuted?.getHex();
    return color ? color : 'red';
  }

  get peakColor(): string {
    const color = this.playerService.selectedSong?.metadata?.coverColors?.LightVibrant?.getHex();
    return color ? color : 'yellow';
  }

  ngOnDestroy(): void {
    this.gamepadService.deregisterButtonAction(GamepadButtons.SELECT_BUTTON);
  }
}
