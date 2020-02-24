import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatSliderChange } from '@angular/material/slider';
import { TitleService } from '@motabass/helper-services/title';
import { formatSecondsAsClock } from '@motabass/helpers/time';
import { GamepadService } from './gamepad.service';
import { PlayerService } from './player.service';
import { Song } from './player.types';

@Component({
  selector: 'mtb-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit {
  position = 0;

  constructor(public media: MediaObserver, private playerService: PlayerService, private titleService: TitleService, private gamepadService: GamepadService) {}

  ngOnInit() {
    setTimeout(() => this.titleService.setTitle('Mediaplayer'));
  }

  ngAfterViewInit() {
    setInterval(() => {
      this.position = this.playerService.currentTime;
    }, 250);
  }

  setSeekPosition(event: MatSliderChange) {
    let sliderValue = event.value;
    if (!sliderValue) {
      return;
    }
    if (sliderValue === -1) {
      sliderValue = 0;
    }
    this.playerService.setSeekPosition(sliderValue);
  }

  get durationSeconds(): number {
    return this.playerService.durationSeconds;
  }

  get songs(): Song[] {
    return this.playerService.songs;
  }

  get playingSong(): Song | undefined {
    return this.playerService.playingSong;
  }

  get selectedSong(): Song | undefined {
    return this.playerService.selectedSong;
  }

  get volume(): number {
    return this.playerService.volume;
  }

  set volume(value: number) {
    this.playerService.volume = value;
  }

  onVolumeChange(event: MatSliderChange) {
    this.volume = event.value ?? 0;
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

  get repeat(): boolean {
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

  async loadFolder() {
    return this.playerService.loadFolder();
  }
}
