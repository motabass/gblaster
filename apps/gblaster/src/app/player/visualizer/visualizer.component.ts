import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Track } from '../player.types';
import { FftSize, FrequencyBarsConfig, OsciloscopeConfig, VisualizerMode, VisualsColorConfig } from './visuals/visuals.types';
import { VisualsService } from './visuals/visuals.service';
import { GamepadService } from '../../services/gamepad/gamepad.service';
import { GamepadButtons } from '../../services/gamepad/gamepad.types';
import { AudioService } from '../audio.service';

@Component({
  selector: 'mtb-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizerComponent implements OnInit, OnDestroy {
  @LocalStorage('smoothing', 0.7) smoothing!: number;

  @LocalStorage('minDb', -73) minDb!: number;

  @LocalStorage('alpha', 1) alpha!: number;

  @LocalStorage('barCount', 24) barCount!: number;

  @LocalStorage('fftSize', 2048) fftSize!: FftSize;

  @LocalStorage('capHeight', 4) capHeight!: number;

  @LocalStorage('gap', 0.5) gap!: number;

  @LocalStorage('capFalldown', 2) capFalldown!: number;

  @LocalStorage('lineThickness', 4) lineThickness!: number;

  @Input() track?: Track | null;

  constructor(private audioService: AudioService, private gamepadService: GamepadService, private visualsService: VisualsService) {}

  ngOnInit(): void {
    this.gamepadService.registerButtonAction(GamepadButtons.SELECT_BUTTON, () => this.toggleVisualMode());
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = this.smoothing;
    this.analyser.minDecibels = this.minDb;
    this.analyser.maxDecibels = 220;
  }

  get visualMode(): VisualizerMode {
    return this.visualsService.visualMode;
  }

  toggleVisualMode() {
    this.visualsService.toggleVisualMode();
  }

  get analyser(): AnalyserNode {
    return this.audioService.analyser;
  }

  get colorConfig(): VisualsColorConfig {
    return { mainColor: this.mainColor, peakColor: this.peakColor, alpha: this.alpha };
  }

  get mainColor(): string | undefined {
    return this.track?.metadata?.coverColors?.darkVibrant?.hex;
  }

  get peakColor(): string | undefined {
    return this.track?.metadata?.coverColors?.lightVibrant?.hex;
  }

  get barsConfig(): FrequencyBarsConfig {
    return { barCount: this.barCount, capHeight: this.capHeight, gap: this.gap, capFalldown: this.capFalldown };
  }

  get oscConfig(): OsciloscopeConfig {
    return { thickness: this.lineThickness };
  }

  get playing(): boolean {
    return this.audioService.playing;
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

  setAlpha(value: number | null) {
    if (value !== null) {
      this.alpha = value;
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

  get sampleRate(): number {
    return this.audioService.sampleRate;
  }

  get showSlidePanel(): boolean {
    return this.visualMode !== 'off';
  }

  ngOnDestroy(): void {
    this.gamepadService.deregisterButtonAction(GamepadButtons.SELECT_BUTTON);
  }
}
