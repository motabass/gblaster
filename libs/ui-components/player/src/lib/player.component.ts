import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { formatSecondsAsClock } from '@motabass/helpers/time';
import { TitleService } from '../../../../../apps/motabass/src/app/title.service';
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
      this.position =
        this.playerService.currentSong && this.playerService.currentSong.howl.playing() ? Math.floor(this.playerService.currentSong.howl.seek() as number) : 0;
    }, 200);
  }

  setSeekPosition(event) {
    const sliderValue = event.value;
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
