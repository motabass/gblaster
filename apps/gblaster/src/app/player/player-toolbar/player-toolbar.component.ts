import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';

import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatToolbar } from '@angular/material/toolbar';
import { TimePipe } from '../time.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { PlayerService } from '../player.service';
import { AudioService } from '../audio.service';
import { formatSecondsAsClock } from '@motabass/helpers';
import { GamepadAxes, GamepadButtons } from '../../services/gamepad/gamepad.types';
import { GamepadService } from '../../services/gamepad/gamepad.service';
import { HotkeysService } from '../../services/hotkeys/hotkeys.service';
import { FileLoaderService } from '../file-loader-service/file-loader.service.abstract';
import { MetadataService } from '../metadata-service/metadata.service';

@Component({
  selector: 'player-toolbar',
  imports: [MatIcon, MatIconButton, MatMenu, MatSlider, MatSliderThumb, MatToolbar, MatTooltip, TimePipe, MatMenuTrigger, MatMenuModule],
  templateUrl: './player-toolbar.component.html',
  styleUrl: './player-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerToolbarComponent implements OnDestroy {
  private readonly gamepadService = inject(GamepadService, { optional: true });
  private readonly hotkeysService = inject(HotkeysService, { optional: true });
  protected readonly fileLoaderService = inject(FileLoaderService);
  protected readonly playerService = inject(PlayerService);
  protected readonly audioService = inject(AudioService);
  protected readonly metadataService = inject(MetadataService);

  protected readonly volumeIcon = computed(() => this.getVolumeIconForLevel(this.audioService.volume()));

  constructor() {
    if (this.hotkeysService) {
      this.hotkeysService.initialize();

      this.hotkeysService.register({ keys: 'shift+p', description: 'Play/Pause', callback: () => this.playerService.playPause() });
    }

    if (this.gamepadService) {
      this.gamepadService.registerButtonAction(GamepadButtons.A_BUTTON, () => this.playerService.playPause());
      this.gamepadService.registerButtonAction(GamepadButtons.B_BUTTON, () => this.playerService.stop());

      this.gamepadService.registerButtonAction(GamepadButtons.X_BUTTON, () => this.toggleShuffle());
      this.gamepadService.registerButtonAction(GamepadButtons.Y_BUTTON, () => this.toggleRepeat());

      this.gamepadService.registerButtonAction(GamepadButtons.L2_BUTTON, (value) => this.seekLeft(value), 'turbo');
      this.gamepadService.registerButtonAction(GamepadButtons.R2_BUTTON, (value) => this.seekRight(value), 'turbo');

      this.gamepadService.registerAxisAction(
        GamepadAxes.S1_X,
        (value) => this.seekRight(value),
        (value) => this.seekLeft(value),
        'turbo',
        64
      );

      this.gamepadService.registerAxisAction(
        GamepadAxes.S2_Y,
        (value) => this.decreaseVolume(value),
        (value) => this.increaseVolume(value),
        'hold'
      );

      this.gamepadService.registerButtonAction(GamepadButtons.S2_BUTTON, () => this.toggleMute());

      this.gamepadService.registerButtonAction(GamepadButtons.DPAD_UP, () => this.playerService.selectPrevious());
      this.gamepadService.registerButtonAction(GamepadButtons.DPAD_DOWN, () => this.playerService.selectNext());
      this.gamepadService.registerAxisAction(
        GamepadAxes.S1_Y,
        () => this.playerService.selectNext(),
        () => this.playerService.selectPrevious(),
        'turbo'
      );

      this.gamepadService.registerButtonAction(GamepadButtons.R1_BUTTON, () => this.playerService.next(), 'turbo');
      this.gamepadService.registerButtonAction(GamepadButtons.L1_BUTTON, () => this.playerService.previous(), 'turbo');

      this.gamepadService.registerButtonAction(GamepadButtons.START_BUTTON, () => this.showFilePickerAndLoadFiles());
    }
  }

  ngOnDestroy(): void {
    if (this.gamepadService) {
      this.gamepadService.deregisterButtonAction(GamepadButtons.A_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.B_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.X_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.Y_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.L2_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.R2_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.S2_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.DPAD_UP);
      this.gamepadService.deregisterButtonAction(GamepadButtons.DPAD_DOWN);
      this.gamepadService.deregisterButtonAction(GamepadButtons.R1_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.L1_BUTTON);
      this.gamepadService.deregisterButtonAction(GamepadButtons.START_BUTTON);
      this.gamepadService.deregisterAxisAction(GamepadAxes.S1_X);
      this.gamepadService.deregisterAxisAction(GamepadAxes.S2_Y);
      this.gamepadService.deregisterAxisAction(GamepadAxes.S1_Y);
    }
  }

  onSliderPositionChanged(value: number) {
    this.playerService.setSeekPosition(value);
  }

  onVolumeChange(value: number) {
    this.audioService.setVolume(value ?? 0);
  }

  private getVolumeIconForLevel(vol: number): string {
    if (vol === 0) return 'volume-variant-off';
    if (vol > 0 && vol < 0.2) return 'volume-low';
    if (vol >= 0.2 && vol < 0.8) return 'volume-medium';
    return 'volume-high';
  }

  formatLabel(value: number): string {
    return formatSecondsAsClock(value, false);
  }

  toggleRepeat() {
    this.playerService.toggleRepeat();
  }

  toggleShuffle() {
    this.playerService.toggleShuffle();
  }

  async showFilePickerAndLoadFiles() {
    await this.fileLoaderService.showPicker();
    return this.playerService.loadFiles();
  }

  async loadLastDirectory() {
    return this.fileLoaderService.currentFolderHandle() ? this.playerService.loadFiles() : this.showFilePickerAndLoadFiles();
  }

  seekLeft(value: number) {
    this.playerService.seekLeft(value + 10);
  }

  seekRight(value: number) {
    this.playerService.seekRight(value + 10);
  }

  increaseVolume(value: number) {
    this.audioService.setVolume(this.audioService.volume() + value / 100);
  }

  decreaseVolume(value: number) {
    this.audioService.setVolume(this.audioService.volume() - value / 100);
  }

  toggleMute() {
    // TODO: implement
  }
}
