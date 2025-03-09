import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import type { FftSize, FrequencyBarsConfig, OsciloscopeConfig } from './visuals/visuals.types';
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
import { PlayerService } from '../player.service';

@Component({
  selector: 'mtb-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrl: './visualizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VisualsDirective, SlidePanelComponent, MatSelectModule, MatOptionModule, MatSliderModule, MatButtonModule, MatIconModule, MatTooltipModule]
})
export class VisualizerComponent implements OnInit, OnDestroy {
  readonly FFT_OPTIONS: FftSize[] = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16_384, 32_768];

  private gamepadService = inject(GamepadService, { optional: true });
  audioService = inject(AudioService);
  playerService = inject(PlayerService);
  visualsService = inject(VisualsService);
  localStorageService = inject(LocalStorageService);

  readonly smoothing = signal<number>(this.localStorageService.retrieve('smoothing') ?? 0.7);
  readonly minDb = signal<number>(this.localStorageService.retrieve('minDb') ?? -73);
  readonly alpha = signal<number>(this.localStorageService.retrieve('alpha') ?? 0.75);
  readonly barCount = signal<number>(this.localStorageService.retrieve('barCount') ?? 24);
  readonly fftSize = signal<FftSize>(this.localStorageService.retrieve('fftSize') ?? 2048);
  readonly capHeight = signal<number>(this.localStorageService.retrieve('capHeight') ?? 4);
  readonly gap = signal<number>(this.localStorageService.retrieve('gap') ?? 0.5);
  readonly capFalldown = signal<number>(this.localStorageService.retrieve('capFalldown') ?? 2);
  readonly lineThickness = signal<number>(this.localStorageService.retrieve('lineThickness') ?? 8);

  analyser: AnalyserNode = this.audioService.plugInNewAnalyserNode();

  constructor() {
    this.analyser.fftSize = this.fftSize();
    this.analyser.smoothingTimeConstant = this.smoothing();
    this.analyser.minDecibels = this.minDb();
    this.analyser.maxDecibels = 220;
  }

  ngOnInit(): void {
    this.gamepadService?.registerButtonAction(GamepadButtons.SELECT_BUTTON, () => this.visualsService.toggleVisualMode());
  }

  ngOnDestroy(): void {
    this.gamepadService?.deregisterButtonAction(GamepadButtons.SELECT_BUTTON);
    this.audioService.disconnectAnalyserNode(this.analyser);
  }

  readonly showSlidePanel = computed(() => {
    return this.visualsService.visualMode() !== 'off';
  });

  readonly colorConfig = computed(() => {
    return { ...this.playerService.colorConfig(), alpha: this.alpha() };
  });

  readonly barsConfig = computed<FrequencyBarsConfig>(() => {
    return { barCount: this.barCount(), capHeight: this.capHeight(), gap: this.gap(), capFalldown: this.capFalldown() };
  });

  readonly oscConfig = computed<OsciloscopeConfig>(() => {
    return { thickness: this.lineThickness() };
  });

  setSmoothing(value: number | null) {
    if (value !== null) {
      this.smoothing.set(value);
      this.analyser.smoothingTimeConstant = value;
      this.localStorageService.store('smoothing', value);
    }
  }

  setMinDb(value: number | null) {
    if (value !== null) {
      this.minDb.set(value);
      this.analyser.minDecibels = value;
      this.localStorageService.store('minDb', value);
    }
  }

  setAlpha(value: number | null) {
    if (value !== null) {
      this.alpha.set(value);
      this.localStorageService.store('alpha', value);
    }
  }

  setFftSize(value: FftSize) {
    this.fftSize.set(value);
    this.analyser.fftSize = value;
    this.localStorageService.store('fftSize', value);
  }

  setBarCount(value: number | null) {
    if (value !== null) {
      this.barCount.set(value);
      this.localStorageService.store('barCount', value);
    }
  }

  setCapHeight(value: number | null) {
    if (value !== null) {
      this.capHeight.set(value);
      this.localStorageService.store('capHeight', value);
    }
  }

  setCapFalldown(value: number | null) {
    if (value !== null) {
      this.capFalldown.set(value);
      this.localStorageService.store('capFalldown', value);
    }
  }

  setLineThickness(value: number | null) {
    if (value !== null) {
      this.lineThickness.set(value);
      this.localStorageService.store('lineThickness', value);
    }
  }

  setGap(value: number | null) {
    if (value !== null) {
      this.gap.set(value);
      this.localStorageService.store('gap', value);
    }
  }
}
