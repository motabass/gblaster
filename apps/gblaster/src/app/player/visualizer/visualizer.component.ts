import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { PlayerService } from '../player.service';
import { Song } from '../player.types';
import { FftSize, FrequencyBarsConfig, OsciloscopeConfig, VisualizerMode, VisualsColorConfig } from './visuals/visuals.types';
import { VisualsService } from './visuals/visuals.service';
import { GamepadService } from '../../services/gamepad/gamepad.service';
import { GamepadButtons } from '../../services/gamepad/gamepad.types';

// TODO: quit app + min + max buttons in electron
// TODO: loading indicator service

@Component({
  selector: 'mtb-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizerComponent implements OnInit, OnDestroy {
  @LocalStorage('smoothing', 0.7) smoothing!: number;

  @LocalStorage('minDb', -75) minDb!: number;

  @LocalStorage('maxDb', -35) maxDb!: number;

  @LocalStorage('barCount', 24) barCount!: number;

  @LocalStorage('fftSize', 4096) fftSize!: FftSize;

  @LocalStorage('capHeight', 4) capHeight!: number;

  @LocalStorage('gap', 0) gap!: number;

  @LocalStorage('capFalldown', 0.5) capFalldown!: number;

  @LocalStorage('lineThickness', 4) lineThickness!: number;

  @Input() song?: Song;

  constructor(private playerService: PlayerService, private gamepadService: GamepadService, private visualsService: VisualsService) {}

  ngOnInit(): void {
    this.gamepadService.registerButtonAction(GamepadButtons.SELECT_BUTTON, () => this.toggleVisualMode());
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = this.smoothing;
    this.analyser.minDecibels = this.minDb;
    this.analyser.maxDecibels = this.maxDb;
  }

  get visualMode(): VisualizerMode {
    return this.visualsService.visualMode;
  }

  toggleVisualMode() {
    this.visualsService.toggleVisualMode();
  }

  get analyser(): AnalyserNode {
    return this.playerService.analyser;
  }

  get colorConfig(): VisualsColorConfig {
    return { mainColor: this.mainColor, peakColor: this.peakColor };
  }

  get mainColor(): string | undefined {
    const color = this.song?.metadata?.coverColors?.darkVibrant?.hex;
    return color ? color : undefined;
  }

  get peakColor(): string | undefined {
    const color = this.song?.metadata?.coverColors?.lightVibrant?.hex;
    return color ? color : undefined;
  }

  get barsConfig(): FrequencyBarsConfig {
    return { barCount: this.barCount, capHeight: this.capHeight, gap: this.gap, capFalldown: this.capFalldown };
  }

  get oscConfig(): OsciloscopeConfig {
    return { thickness: this.lineThickness };
  }

  get playing(): boolean {
    return this.playerService.playing;
  }

  setFftSize(value: FftSize) {
    this.fftSize = value;
    this.analyser.fftSize = value;
  }

  setSmoothing(value: number | null) {
    if (value !== null) {
      this.smoothing = value;
      this.analyser.smoothingTimeConstant = value;
    }
  }

  setMinDb(value: number | null) {
    if (value !== null) {
      this.minDb = value;
      this.analyser.minDecibels = value;
    }
  }

  setMaxDb(value: number | null) {
    if (value !== null) {
      this.maxDb = value;
      this.analyser.maxDecibels = value;
    }
  }

  setBarCount(value: number | null) {
    if (value !== null) {
      this.barCount = value;
    }
  }

  setCapHeight(value: number | null) {
    if (value !== null) {
      this.capHeight = value;
    }
  }

  setCapFalldown(value: number | null) {
    if (value !== null) {
      this.capFalldown = value;
    }
  }

  setLineThickness(value: number | null) {
    if (value !== null) {
      this.lineThickness = value;
    }
  }

  setGap(value: number | null) {
    if (value !== null) {
      this.gap = value;
    }
  }

  get fftOptions(): number[] {
    const options: number[] = [];
    for (let i = 32; i <= 32768; i *= 2) {
      options.push(i);
    }
    return options;
  }

  get showSlidePanel(): boolean {
    return this.visualMode !== 'off';
  }

  ngOnDestroy(): void {
    this.gamepadService.deregisterButtonAction(GamepadButtons.SELECT_BUTTON);
  }
}
