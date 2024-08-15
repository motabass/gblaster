import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { formatSecondsAsClock } from '@motabass/helpers';
import { ALLOWED_MIMETYPES } from './file-loader-service/file-loader.helpers';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { PlayerService } from './player.service';
import { RepeatMode } from './player.types';
import { HotkeysService } from '../services/hotkeys/hotkeys.service';
import { GamepadService } from '../services/gamepad/gamepad.service';
import { GamepadAxes, GamepadButtons } from '../services/gamepad/gamepad.types';
import { TitleService } from '../services/title.service';
import { AudioService } from './audio.service';
import { TimePipe } from './time.pipe';
import { FileDropOverlayComponent } from '@motabass/ui-components/file-drop-overlay';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgClass, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { PlaylistComponent } from './playlist/playlist.component';

@Component({
  selector: 'mtb-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PlaylistComponent,
    NgIf,
    MatButtonModule,
    MatIconModule,
    CoverDisplayComponent,
    VisualizerComponent,
    MatToolbarModule,
    MatTooltipModule,
    MatSliderModule,
    MatMenuModule,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    FileDropOverlayComponent,
    AsyncPipe,
    TimePipe
  ]
})
export class PlayerComponent implements OnInit, OnDestroy {
  positionUpdateActive = true;

  constructor(
    public playerService: PlayerService,
    private titleService: TitleService,
    private gamepadService: GamepadService,
    private hotkeysService: HotkeysService,
    private fileLoaderService: FileLoaderService,
    private audioService: AudioService
  ) {}

  async ngOnInit() {
    this.titleService.setTitle('gBlaster');

    this.hotkeysService.initialize();

    this.hotkeysService.register({ keys: 'shift+p', description: 'Play/Pause', callback: () => this.playPause() });

    this.gamepadService.registerButtonAction(GamepadButtons.A_BUTTON, () => this.playPause());
    this.gamepadService.registerButtonAction(GamepadButtons.B_BUTTON, () => this.stop());

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

    this.gamepadService.registerButtonAction(GamepadButtons.R1_BUTTON, () => this.next(), 'turbo');
    this.gamepadService.registerButtonAction(GamepadButtons.L1_BUTTON, () => this.previous(), 'turbo');

    this.gamepadService.registerButtonAction(GamepadButtons.START_BUTTON, () => this.showPicker());
  }

  async onReload() {
    await this.fileLoaderService.init();
    return this.fileLoaderService.currentFolderHandle ? this.loadFiles() : this.showPicker();
  }

  get isPlaylistEmpty(): boolean {
    return this.playerService.currentPlaylist().length === 0;
  }

  onSliderPositionChanged(value: number) {
    this.positionUpdateActive = true;

    if (value !== null) {
      this.playerService.setSeekPosition(value);
    }
  }

  pauseSliderPositionUpdate() {
    this.positionUpdateActive = false;
  }

  seekLeft(value: number) {
    this.playerService.seekLeft(value + 10);
  }

  seekRight(value: number) {
    this.playerService.seekRight(value * 10);
  }

  get volume(): number {
    return this.audioService.volume;
  }

  set volume(value: number) {
    this.audioService.setVolume(value);
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

  onVolumeChange(value: number) {
    this.volume = value ?? 0;
  }
  async onFilesDropped(files: File[]) {
    return this.playerService.addFilesToPlaylist(...files);
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
    void this.playerService.playPause();
  }

  stop() {
    this.playerService.stop();
  }

  next() {
    void this.playerService.next();
  }

  previous() {
    void this.playerService.previous();
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
    return this.playerService.playing();
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
