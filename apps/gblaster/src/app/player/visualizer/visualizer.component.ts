import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import type { FftSize, FrequencyBarsConfig, OsciloscopeConfig } from './visuals/visuals.types';
import { VisualsService } from './visuals/visuals.service';
import { GamepadService } from '../../services/gamepad/gamepad.service';
import { GamepadButtons } from '../../services/gamepad/gamepad.types';
import { AudioService } from '../audio.service';
import { SlidePanelComponent } from '@motabass/ui-components/slide-panel';
import { VisualsDirective } from './visuals/visuals.directive';
import { PlayerService } from '../player.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatIcon } from '@angular/material/icon';

/**
Renders the audio visualizer and exposes controls for its visual settings.
*/
@Component({
  selector: 'mtb-visualizer',
  imports: [VisualsDirective, SlidePanelComponent, MatSelect, MatOption, MatSlider, MatSliderThumb, MatIcon],
  templateUrl: './visualizer.component.html',
  styleUrl: './visualizer.component.scss'
})
export class VisualizerComponent implements OnInit, OnDestroy {
  readonly #gamepadService = inject(GamepadService, { optional: true });
  readonly #playerService = inject(PlayerService);
  readonly #localStorageService = inject(LocalStorageService);
  protected readonly visualsService = inject(VisualsService);
  protected readonly audioService = inject(AudioService);

  protected readonly FFT_OPTIONS: FftSize[] = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16_384, 32_768];

  protected readonly smoothing = signal<number>(this.#localStorageService.retrieve('smoothing') ?? 0.7);
  protected readonly minDb = signal<number>(this.#localStorageService.retrieve('minDb') ?? -73);
  protected readonly alpha = signal<number>(this.#localStorageService.retrieve('alpha') ?? 0.75);
  protected readonly barCount = signal<number>(this.#localStorageService.retrieve('barCount') ?? 24);
  protected readonly fftSize = signal<FftSize>(this.#localStorageService.retrieve('fftSize') ?? 2048);
  protected readonly capHeight = signal<number>(this.#localStorageService.retrieve('capHeight') ?? 4);
  protected readonly gap = signal<number>(this.#localStorageService.retrieve('gap') ?? 0.5);
  protected readonly capFalldown = signal<number>(this.#localStorageService.retrieve('capFalldown') ?? 2);
  protected readonly lineThickness = signal<number>(this.#localStorageService.retrieve('lineThickness') ?? 8);

  protected readonly analyser: AnalyserNode = this.audioService.plugInNewAnalyserNode();

  /**
   * Initializes the audio analyser with the persisted visualizer settings.
   */
  constructor() {
    this.analyser.fftSize = this.fftSize();
    this.analyser.smoothingTimeConstant = this.smoothing();
    this.analyser.minDecibels = this.minDb();
    this.analyser.maxDecibels = 220;
  }

  /**
  Registers the gamepad shortcut for changing the visualizer mode.
  */
  ngOnInit(): void {
    this.#gamepadService?.registerButtonAction(GamepadButtons.SELECT_BUTTON, () =>
      this.visualsService.toggleVisualMode()
    );
  }

  /**
  Releases the gamepad shortcut and audio analyser when the component is destroyed.
  */
  ngOnDestroy(): void {
    this.#gamepadService?.deregisterButtonAction(GamepadButtons.SELECT_BUTTON);
    this.audioService.disconnectAnalyserNode(this.analyser);
  }

  protected readonly showSlidePanel = computed(() => {
    return this.visualsService.visualMode() !== 'off';
  });

  protected readonly colorConfig = computed(() => {
    return { ...this.#playerService.colorConfig(), alpha: this.alpha() };
  });

  protected readonly barsConfig = computed<FrequencyBarsConfig>(() => {
    return {
      barCount: this.barCount(),
      capHeight: this.capHeight(),
      gap: this.gap(),
      capFalldown: this.capFalldown()
    };
  });

  protected readonly oscConfig = computed<OsciloscopeConfig>(() => {
    return { thickness: this.lineThickness() };
  });

  /**
  Updates smoothing configuration and applies it to the analyser.
  @param value Smoothing value, or null when no value is selected.
  */
  protected setSmoothing(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.smoothing.set(value);
    this.analyser.smoothingTimeConstant = value;
    this.#localStorageService.store('smoothing', value);
  }

  /**
  Updates the analyser's minimum decibel level.
  @param value Minimum decibel level, or null when no value is selected.
  */
  protected setMinDb(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.minDb.set(value);
    this.analyser.minDecibels = value;
    this.#localStorageService.store('minDb', value);
  }

  /**
  Updates the visualizer color transparency.
  @param value Alpha value, or null when no value is selected.
  */
  protected setAlpha(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.alpha.set(value);
    this.#localStorageService.store('alpha', value);
  }

  /**
  Sets the analyser FFT size and persists it.
  @param value FFT size to apply.
  */
  protected setFftSize(value: FftSize) {
    this.fftSize.set(value);
    this.analyser.fftSize = value;
    this.#localStorageService.store('fftSize', value);
  }

  /**
  Updates the number of frequency bars.
  @param value Bar count, or null when no value is selected.
  */
  protected setBarCount(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.barCount.set(value);
    this.#localStorageService.store('barCount', value);
  }

  /**
  Updates the visualizer bar-cap height.
  @param value Cap height, or null when no value is selected.
  */
  protected setCapHeight(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.capHeight.set(value);
    this.#localStorageService.store('capHeight', value);
  }

  /**
  Updates the visualizer bar-cap fall speed.
  @param value Fall speed, or null when no value is selected.
  */
  protected setCapFalldown(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.capFalldown.set(value);
    this.#localStorageService.store('capFalldown', value);
  }

  /**
  Updates the oscilloscope line thickness.
  @param value Line thickness, or null when no value is selected.
  */
  protected setLineThickness(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.lineThickness.set(value);
    this.#localStorageService.store('lineThickness', value);
  }

  /**
  Updates the spacing between visualizer bars.
  @param value Bar gap, or null when no value is selected.
  */
  protected setGap(value: number | null) {
    if (!(value !== null)) {
      return;
    }

    this.gap.set(value);
    this.#localStorageService.store('gap', value);
  }
}
