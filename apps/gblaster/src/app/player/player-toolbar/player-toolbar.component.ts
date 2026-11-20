import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatToolbar } from '@angular/material/toolbar';
import { TimePipe } from '../time.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { PlayerService } from '../player.service';
import { AudioService } from '../audio.service';
import { formatSecondsAsClock } from '@motabass/helpers';
import { gamepadAxes, gamepadButtons, GamepadService } from '../../services/gamepad/gamepad.service';
import { HotkeysService } from '../../services/hotkeys/hotkeys.service';
import { ProgressService } from '../metadata-service/progress.service';

/**
Provides playback controls and connects keyboard and gamepad shortcuts.
*/
@Component({
  selector: 'player-toolbar',
  imports: [
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuTrigger,
    MatSlider,
    MatSliderThumb,
    MatToolbar,
    MatTooltip,
    TimePipe
  ],
  templateUrl: './player-toolbar.component.html',
  styleUrl: './player-toolbar.component.scss'
})
export class PlayerToolbarComponent implements OnInit, OnDestroy {
  readonly #gamepadService = inject(GamepadService, { optional: true });
  readonly #hotkeysService = inject(HotkeysService, { optional: true });
  protected readonly playerService = inject(PlayerService);
  protected readonly audioService = inject(AudioService);
  protected readonly progressService = inject(ProgressService);

  protected readonly volumeIcon = computed(() => this.#getVolumeIconForLevel(this.audioService.volume()));

  /**
  Registers keyboard shortcuts and gamepad actions when available.
  */
  ngOnInit() {
    if (this.#hotkeysService) {
      this.#hotkeysService.initialize();

      this.#hotkeysService.register({
        keys: 'shift+p',
        description: 'Play/Pause',
        callback: () => this.playerService.playPause()
      });
    }

    if (!this.#gamepadService) {
      return;
    }

    this.#gamepadService.registerButtonAction(gamepadButtons.A_BUTTON, () => this.playerService.playPause());
    this.#gamepadService.registerButtonAction(gamepadButtons.B_BUTTON, () => this.playerService.stop());

    this.#gamepadService.registerButtonAction(gamepadButtons.X_BUTTON, () => this.toggleShuffle());
    this.#gamepadService.registerButtonAction(gamepadButtons.Y_BUTTON, () => this.toggleRepeat());

    this.#gamepadService.registerButtonAction(gamepadButtons.L2_BUTTON, (value) => this.seekLeft(value), 'turbo');
    this.#gamepadService.registerButtonAction(gamepadButtons.R2_BUTTON, (value) => this.seekRight(value), 'turbo');

    this.#gamepadService.registerAxisAction(
      gamepadAxes.S1_X,
      (value) => this.seekRight(value),
      (value) => this.seekLeft(value),
      'turbo',
      64
    );

    this.#gamepadService.registerAxisAction(
      gamepadAxes.S2_Y,
      (value) => this.decreaseVolume(value),
      (value) => this.increaseVolume(value),
      'hold'
    );

    this.#gamepadService.registerButtonAction(gamepadButtons.S2_BUTTON, () => this.toggleMute());

    this.#gamepadService.registerButtonAction(gamepadButtons.DPAD_UP, () => this.playerService.selectPrevious());
    this.#gamepadService.registerButtonAction(gamepadButtons.DPAD_DOWN, () => this.playerService.selectNext());
    this.#gamepadService.registerAxisAction(
      gamepadAxes.S1_Y,
      () => this.playerService.selectNext(),
      () => this.playerService.selectPrevious(),
      'turbo'
    );

    this.#gamepadService.registerButtonAction(gamepadButtons.R1_BUTTON, () => this.playerService.next(), 'turbo');
    this.#gamepadService.registerButtonAction(gamepadButtons.L1_BUTTON, () => this.playerService.previous(), 'turbo');

    this.#gamepadService.registerButtonAction(gamepadButtons.START_BUTTON, () => this.showFilePickerAndAddToLibrary());
  }

  /**
  Restores the gamepad actions when the toolbar is destroyed.
  */
  ngOnDestroy(): void {
    if (!this.#gamepadService) {
      return;
    }

    this.#gamepadService.deregisterButtonAction(gamepadButtons.A_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.B_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.X_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.Y_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.L2_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.R2_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.S2_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.DPAD_UP);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.DPAD_DOWN);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.R1_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.L1_BUTTON);
    this.#gamepadService.deregisterButtonAction(gamepadButtons.START_BUTTON);
    this.#gamepadService.deregisterAxisAction(gamepadAxes.S1_X);
    this.#gamepadService.deregisterAxisAction(gamepadAxes.S2_Y);
    this.#gamepadService.deregisterAxisAction(gamepadAxes.S1_Y);
  }

  /**
  Applies a slider-selected playback position.
  @param value Playback position in seconds.
  */
  protected onSliderPositionChanged(value: number) {
    this.playerService.setSeekPosition(value);
  }

  /**
  Applies a slider-selected output volume.
  @param value Output volume from zero to one.
  */
  protected onVolumeChange(value = 0) {
    this.audioService.setVolume(value);
  }

  /**
  Selects the volume icon that corresponds to a volume level.
  @param vol Output volume from zero to one.
  @returns Icon name for the volume level.
  */
  #getVolumeIconForLevel(vol: number): string {
    if (vol === 0) return 'volume-variant-off';
    if (vol > 0 && vol < 0.2) return 'volume-low';
    return vol >= 0.2 && vol < 0.8 ? 'volume-medium' : 'volume-high';
  }

  /**
  Formats the playback position shown by the slider.
  @param value Playback position in seconds.
  @returns Clock-formatted playback position.
  */
  protected formatLabel(value: number): string {
    return formatSecondsAsClock(value, false);
  }

  /**
  Advances the repeat mode.
  */
  protected toggleRepeat() {
    this.playerService.toggleRepeat();
  }

  /**
  Toggles playlist shuffle.
  */
  protected toggleShuffle() {
    this.playerService.toggleShuffle();
  }

  /**
  Opens the file picker and adds selected tracks to the library.
  */
  protected async showFilePickerAndAddToLibrary() {
    return this.playerService.loadFilesToLibrary();
  }

  /**
  Seeks backward using the gamepad's input value as an offset.
  @param value Gamepad input value.
  */
  protected seekLeft(value: number) {
    this.playerService.seekLeft(value + 10);
  }

  /**
  Seeks forward using the gamepad's input value as an offset.
  @param value Gamepad input value.
  */
  protected seekRight(value: number) {
    this.playerService.seekRight(value + 10);
  }

  /**
  Increases volume according to the gamepad input value.
  @param value Gamepad input value.
  */
  protected increaseVolume(value: number) {
    this.audioService.setVolume(this.audioService.volume() + value / 100);
  }

  /**
  Decreases volume according to the gamepad input value.
  @param value Gamepad input value.
  */
  protected decreaseVolume(value: number) {
    this.audioService.setVolume(this.audioService.volume() - value / 100);
  }

  /**
  Toggles audio mute.
  */
  protected toggleMute() {
    // TODO: implement
  }
}
