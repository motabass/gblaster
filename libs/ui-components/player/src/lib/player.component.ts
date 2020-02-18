import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatSliderChange } from '@angular/material/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { HowlerService } from './howler.service';
import { MetadataService } from './metadata.service';
import { NativeFileLoaderService } from './native-file-loader.service';
import { Song, SongMetadata } from './player.types';

@Component({
  selector: 'mtb-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit {
  visuals = true;
  shuffle = false;

  songs: Song[];
  position = 0;

  _currentSong: Song;

  set currentSong(song: Song) {
    if (this._currentSong) {
      this._currentSong.sound.unload();
    }
    this._currentSong = song;
    this.currentSong.sound.load();
  }

  get currentSong(): Song {
    return this._currentSong;
  }

  @ViewChild('nativeSeeker') nativeSeeker: ElementRef;

  constructor(
    public media: MediaObserver,
    private domSanitizer: DomSanitizer,
    private fileLoaderService: NativeFileLoaderService,
    private metadataService: MetadataService,
    private howlerService: HowlerService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // setInterval(() => {
    //   this.position = this.nativeSeeker.nativeElement.value;
    // }, 200);
  }

  get analyser(): AnalyserNode {
    return this.howlerService.getAnalyzer();
  }

  async loadFile() {
    const file = await this.fileLoaderService.openFile();

    const metadata: SongMetadata = await this.metadataService.extractMetadata(file);

    this.currentSong = {
      sound: this.howlerService.createHowlFromFile(file),
      name: metadata.title,
      artist: metadata.artist,
      cover_art_url: metadata.cover ? this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(metadata.cover)) : 'assets/cover-art-placeholder.svg',
      type: file.type
    };

    this.songs = [this.currentSong];
  }

  playSong(song: Song) {
    if (!song.sound.playing()) {
      song.sound.play();
    } else {
      song.sound.pause();
    }
  }

  globalPlayPause() {
    if (!this.currentSong) {
      return;
    }
    if (!this.howlerService.isPlaying()) {
      this.howlerService.play();
    } else {
      this.howlerService.pause();
    }
  }

  globalStop() {
    if (!this.currentSong) {
      return;
    }
    this.howlerService.stop();
  }

  previous() {}

  next() {}

  get isPlaying(): boolean {
    return this.currentSong && this.currentSong.sound.playing();
  }

  toggleVisuals() {
    this.visuals = !this.visuals;
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
  }

  setPosition(event: MatSliderChange) {
    console.log(event);
  }
}
