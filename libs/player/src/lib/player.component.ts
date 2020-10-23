import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { GamepadAxes, GamepadButtons, GamepadService } from '@motabass/helper-services/gamepad';
import { HotkeysService } from '@motabass/helper-services/hotkeys';
import { TitleService } from '@motabass/helper-services/title';
import { formatSecondsAsClock } from '@motabass/helpers/time';
import { ALLOWED_MIMETYPES } from './file-loader-service/file-loader.helpers';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { PlayerService } from './player.service';
import { RepeatMode, Song } from './player.types';

@Component({
  selector: 'mtb-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  private interval?: number;

  position = 0;

  constructor(
    private playerService: PlayerService,
    private titleService: TitleService,
    private gamepadService: GamepadService,
    private hotkeysService: HotkeysService,
    private fileLoaderService: FileLoaderService
  ) {}

  async ngOnInit() {
    setTimeout(() => this.titleService.setTitle('gBlaster')); // TODO: find better way

    this.hotkeysService.initialize();

    this.hotkeysService.register({ keys: 'shift+p', description: 'Play/Pause', callback: () => this.playPause() });

    this.gamepadService.registerButtonAction(GamepadButtons.A_BUTTON, () => this.playPause());
    this.gamepadService.registerButtonAction(GamepadButtons.B_BUTTON, () => this.stop());

    this.gamepadService.registerButtonAction(GamepadButtons.X_BUTTON, () => this.toggleShuffle());
    this.gamepadService.registerButtonAction(GamepadButtons.Y_BUTTON, () => this.toggleRepeat());

    this.gamepadService.registerButtonAction(GamepadButtons.L2_BUTTON, (value) => this.seekLeft(value), 'turbo');
    this.gamepadService.registerButtonAction(GamepadButtons.R2_BUTTON, (value) => this.seekRight(value), 'turbo');
    this.gamepadService.registerAxisAction(GamepadAxes.S1_X, (value) => this.alterSeekPositionByAxis(value), 'turbo', 64);

    this.gamepadService.registerAxisAction(GamepadAxes.S2_Y, (value) => this.alterVolumeByAxis(value), 'hold');
    this.gamepadService.registerButtonAction(GamepadButtons.S2_BUTTON, () => this.toggleMute());

    this.gamepadService.registerButtonAction(GamepadButtons.DPAD_UP, () => this.playerService.selectPrevious());
    this.gamepadService.registerButtonAction(GamepadButtons.DPAD_DOWN, () => this.playerService.selectNext());
    this.gamepadService.registerAxisAction(GamepadAxes.S1_Y, (value) => this.alterSelectionByAxis(value), 'turbo');

    this.gamepadService.registerButtonAction(GamepadButtons.R1_BUTTON, () => this.next(), 'turbo');
    this.gamepadService.registerButtonAction(GamepadButtons.L1_BUTTON, () => this.previous(), 'turbo');

    this.gamepadService.registerButtonAction(GamepadButtons.START_BUTTON, () => this.showPicker());
    await this.fileLoaderService.init();

    if (this.fileLoaderService.currentFolderHandle) {
      return this.loadFiles();
    }
  }

  ngAfterViewInit() {
    this.interval = window.setInterval(() => {
      this.position = this.playerService.getCurrentTime();
    }, 250);
  }

  onSliderPositionChanged(event: MatSliderChange) {
    const value = event.value;
    if (value !== null) {
      this.playerService.setSeekPosition(value);
    }
  }

  seekLeft(value: number) {
    this.playerService.seekLeft(value + 10);
  }

  seekRight(value: number) {
    this.playerService.seekRight(value * 10);
  }

  alterSeekPositionByAxis(value: number) {
    if (value > 0) {
      this.seekRight(value);
    }

    if (value < 0) {
      this.seekLeft(value * -1);
    }
  }

  get durationSeconds(): number {
    return this.playerService.durationSeconds;
  }

  get playingSong(): Song | undefined {
    return this.playerService.playingSong;
  }

  get volume(): number {
    return this.playerService.volume;
  }

  set volume(value: number) {
    this.playerService.setVolume(value);
  }

  toggleMute() {
    // TODO: implement
  }

  increaseVolume(value: number) {
    this.volume = this.volume + value / 100;
  }

  decreaseVolume(value: number) {
    this.volume = this.volume - value / 100;
  }

  alterVolumeByAxis(value: number) {
    if (value > 0) {
      this.decreaseVolume(value);
    }

    if (value < 0) {
      this.increaseVolume(value * -1);
    }
  }

  onVolumeChange(event: MatSliderChange) {
    this.volume = event.value ?? 0;
  }
  onFilesDropped(files: File[]) {
    this.playerService.addFilesToPlaylist(files);
  }

  get allowedTypes(): string[] {
    return ALLOWED_MIMETYPES;
  }

  alterSelectionByAxis(value: number) {
    if (value < 0) {
      this.playerService.selectPrevious();
    }

    if (value > 0) {
      this.playerService.selectNext();
    }
  }

  playPause() {
    this.playerService.playPause();
  }

  stop() {
    this.playerService.stop();
  }

  next() {
    this.playerService.next();
  }

  previous() {
    this.playerService.previous();
  }

  get volumeIcon(): string {
    const vol = this.volume;
    if (vol === 0) {
      return 'volume-variant-off';
    }
    if (vol > 0 && vol < 0.2) {
      return 'volume-low';
    }
    if (vol >= 0.2 && vol < 0.8) {
      return 'volume-medium';
    }

    return 'volume-high';
  }

  get playing(): boolean {
    return this.playerService.playing;
  }

  get shuffle(): boolean {
    return this.playerService.shuffle;
  }

  get repeat(): RepeatMode {
    return this.playerService.repeat;
  }

  toggleRepeat() {
    this.playerService.toggleRepeat();
  }

  toggleShuffle() {
    this.playerService.toggleShuffle();
  }

  formatLabel(value: number): string {
    return formatSecondsAsClock(value, false);
  }

  async showPicker() {
    await this.fileLoaderService.showPicker();
    return this.loadFiles();
  }

  async loadFiles() {
    return this.playerService.loadFiles();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
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
