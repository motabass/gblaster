import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatSliderChange } from '@angular/material/slider';
import { formatSecondsAsClock } from '@motabass/helpers/time'; // TODO: make helper publishable
import { TitleService } from '../../../../apps/motabass/src/app/title.service'; // TODO: extract Title Service to lib
import { PlayerService } from './player.service';
import { Song } from './player.types';

@Component({
  selector: 'mtb-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit {
  repeat = false;
  shuffle = false;

  position = 0;

  constructor(public media: MediaObserver, private playerService: PlayerService, private titleService: TitleService) {}

  ngOnInit() {
    setTimeout(() => this.titleService.setTitle('Mediaplayer'));
  }

  ngAfterViewInit() {
    setInterval(() => {
      this.position = this.playerService.currentTime;
    }, 250);
  }

  setSeekPosition(event) {
    let sliderValue = event.value;
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

  get currentSong(): Song {
    return this.playerService.currentSong;
  }

  get analyser(): AnalyserNode {
    return this.playerService.analyser;
  }

  get volume(): number {
    return this.playerService.volume;
  }

  set volume(value: number) {
    this.playerService.volume = value;
  }

  onVolumeChange(event: MatSliderChange) {
    this.volume = event.value;
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

  toggleRepeat() {
    this.repeat = !this.repeat;
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
  }

  formatLabel(value: number): string {
    return formatSecondsAsClock(value, false);
  }

  loadFolder() {
    this.playerService.loadFolder();
  }
}
