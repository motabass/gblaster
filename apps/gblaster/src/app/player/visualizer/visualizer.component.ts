import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Track } from '../player.types';
import type { FftSize, FrequencyBarsConfig, OsciloscopeConfig, VisualsColorConfig } from './visuals/visuals.types';
import { VisualsService } from './visuals/visuals.service';
import { GamepadService } from '../../services/gamepad/gamepad.service';
import { GamepadButtons } from '../../services/gamepad/gamepad.types';
import { AudioService } from '../audio.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SlidePanelComponent } from '@motabass/ui-components/slide-panel';
import { VisualsDirective } from './visuals/visuals.directive';

@Component({
  selector: 'mtb-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrl: './visualizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualsDirective, SlidePanelComponent, MatSelectModule, MatOptionModule, MatSliderModule, MatButtonModule, MatIconModule, MatTooltipModule]
})
export class VisualizerComponent implements OnInit, OnDestroy {
  private audioService = inject(AudioService);
  private gamepadService = inject(GamepadService, { optional: true });
  visualsService = inject(VisualsService);

  @LocalStorage('smoothing', 0.7) smoothing!: number;

  @LocalStorage('minDb', -73) minDb!: number;

  @LocalStorage('alpha', 0.75) alpha!: number;

  @LocalStorage('barCount', 24) barCount!: number;

  @LocalStorage('fftSize', 2048) fftSize!: FftSize;

  @LocalStorage('capHeight', 4) capHeight!: number;

  @LocalStorage('gap', 0.5) gap!: number;

  @LocalStorage('capFalldown', 2) capFalldown!: number;

  @LocalStorage('lineThickness', 8) lineThickness!: number;

  readonly track = input<Track | null>();

  analyser: AnalyserNode;

  constructor() {
    const analyser = this.audioService.plugAnalyser();
    analyser.fftSize = this.fftSize;
    analyser.smoothingTimeConstant = this.smoothing;
    analyser.minDecibels = this.minDb;
    analyser.maxDecibels = 220;
    this.analyser = analyser;
  }

  ngOnInit(): void {
    this.gamepadService?.registerButtonAction(GamepadButtons.SELECT_BUTTON, () => this.toggleVisualMode());
  }

  toggleVisualMode() {
    this.visualsService.toggleVisualMode();
  }

  get colorConfig(): VisualsColorConfig {
    return { mainColor: this.mainColor, peakColor: this.peakColor, alpha: this.alpha };
  }

  get mainColor(): string | undefined {
    return this.track()?.metadata?.coverColors?.darkVibrant?.hex;
  }

  get peakColor(): string | undefined {
    return this.track()?.metadata?.coverColors?.lightVibrant?.hex;
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
    for (let index = 32; index <= 32_768; index *= 2) {
      options.push(index);
    }
    return options;
  }

  get sampleRate(): number {
    return this.audioService.sampleRate;
  }

  get showSlidePanel(): boolean {
    return this.visualsService.visualMode() !== 'off';
  }

  ngOnDestroy(): void {
    this.gamepadService?.deregisterButtonAction(GamepadButtons.SELECT_BUTTON);
    this.analyser.disconnect();
  }
}
