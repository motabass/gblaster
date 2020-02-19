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

  songs: Song[] = [];
  position = 0;

  currentSong: Song;

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

  private async createSongFromFile(file: File): Promise<Song> {
    const metadata: SongMetadata = await this.metadataService.extractMetadata(file);

    return {
      howl: this.howlerService.createHowlFromFile(file),
      name: metadata.title,
      artist: metadata.artist,
      cover_art_url: metadata.cover ? this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(metadata.cover)) : 'assets/cover-art-placeholder.svg',
      type: file.type
    };
  }

  // async loadFile() {
  //   const file = await this.fileLoaderService.openFile();
  //   this.currentSong = await this.createSongFromFile(file);
  //   this.songs = [this.currentSong];
  // }

  async loadFolder() {
    const files = await this.fileLoaderService.openFolder();
    const songs: Song[] = [];
    for (const file of files) {
      const song = await this.createSongFromFile(file);
      songs.push(song);
    }
    this.songs = songs;
  }

  playSong(song: Song) {
    if (this.currentSong && song.howl === this.currentSong.howl) {
      song.howl.play();
      return;
    }

    if (this.playing) {
      this.currentSong.howl.stop();
    }
    this.currentSong = song;
    this.howlerService.playSong(song);
  }

  playPause() {
    if (!this.currentSong) {
      return;
    }
    if (!this.currentSong.howl.playing()) {
      this.currentSong.howl.play();
    } else {
      this.currentSong.howl.pause();
    }
  }

  stop() {
    if (!this.currentSong) {
      return;
    }
    if (this.playing) {
      this.currentSong.howl.stop();
    }
  }

  previous() {}

  next() {}

  get playing(): boolean {
    return this.currentSong && this.currentSong.howl.playing();
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
