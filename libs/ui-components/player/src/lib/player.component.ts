import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatSliderChange } from '@angular/material/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { VisualsService } from '../../../visuals/src/lib/visuals.service';
import { HowlerService } from './howler.service';
import { MetadataService } from './metadata.service';
import { NativeFileLoaderService } from './native-file-loader.service';
import { Song, SongMetadata } from './player.types';

// TODO: listen to events and show snackbar play, pause, stop
// TODO: check if works when new file added
// TODO: volume
// TODO: https://wicg.github.io/mediasession/ for better sound notification

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
    private howlerService: HowlerService,
    private visualsService: VisualsService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // setInterval(() => {
    //   this.position = this.nativeSeeker.nativeElement.value;
    // }, 200);
  }

  async loadFile() {
    const file = await this.fileLoaderService.openFile();
    const metadata: SongMetadata = await this.metadataService.extractMetadata(file);

    this.currentSong = {
      sound: this.howlerService.createSound(file, () => {
        this.visualsService.visualize(this.howlerService.analyser);
      }),
      name: metadata.title,
      artist: metadata.artist,
      cover_art_url: this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(metadata.cover)),
      type: file.type
    };

    this.songs = [this.currentSong];
  }

  globalPlayPause() {
    if (!this.currentSong) {
      return;
    }
    if (this.currentSong.sound.playing()) {
      this.currentSong.sound.pause();
    } else {
      this.currentSong.sound.play();
    }
  }

  globalStop() {
    if (!this.currentSong) {
      return;
    }
    this.currentSong.sound.stop();
  }

  previous() {
  }

  next() {
  }

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
