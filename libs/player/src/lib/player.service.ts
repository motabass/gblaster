import { Injectable } from '@angular/core';
import { HowlerService } from './howler.service';
import { MetadataService } from './metadata.service';
import { NativeFileLoaderService } from './native-file-loader.service';
import { Song, SongMetadata } from './player.types';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  get songs(): Song[] {
    return this._songs;
  }

  set songs(songs: Song[]) {
    this._songs = songs;

    const firstSong = songs[0];

    this.howlerService.triggerLoad(firstSong);
    this.currentSong = firstSong;
  }
  private _songs: Song[] = [];

  currentSong: Song;

  constructor(private howlerService: HowlerService, private fileLoaderService: NativeFileLoaderService, private metadataService: MetadataService) {
    if ('mediaSession' in navigator) {
      // @ts-ignore
      navigator.mediaSession.setActionHandler('play', this.playPause.bind(this));
      // @ts-ignore
      navigator.mediaSession.setActionHandler('pause', this.playPause.bind(this));
      // @ts-ignore
      navigator.mediaSession.setActionHandler('nexttrack', this.next.bind(this));
      // @ts-ignore
      navigator.mediaSession.setActionHandler('previoustrack', this.previous.bind(this));
    }
  }

  async loadFolder() {
    const newFolder: boolean = await this.fileLoaderService.openFolder();
    if (newFolder) {
      const fileHandles = this.fileLoaderService.currentFolderFileHandles;
      const songs: Song[] = [];
      for (const fileHandle of fileHandles) {
        const song = await this.createSongFromFileHandle(fileHandle);
        songs.push(song);
      }
      this.songs = songs;
    }
  }

  private async createSongFromFileHandle(fileHandle: any): Promise<Song> {
    const file = await fileHandle.getFile();
    const metadata: SongMetadata = await this.metadataService.extractMetadata(file);

    return {
      howl: this.howlerService.createHowlFromFile(file),
      fileHandle: fileHandle,
      metadata: metadata
    };
  }

  get analyser(): AnalyserNode {
    return this.howlerService.getAnalyzer();
  }

  setSeekPosition(sliderValue) {
    this.currentSong.howl.seek(sliderValue);
  }

  get durationSeconds(): number {
    return this.currentSong ? Math.round(this.currentSong.howl.duration()) : 0;
  }

  playSong(song: Song) {
    if (this.currentSong && song.howl === this.currentSong.howl) {
      this.howlerService.playSong(song);
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
      this.howlerService.playSong(this.currentSong);
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

  next() {
    if (!this.currentSong) {
      return;
    }
    const currPo = this.currentSong.playlistPosition;
    if (currPo < this._songs.length && this.currentSong.howl.playing()) {
      this.playSong(this._songs[currPo]);
    }
  }

  previous() {
    if (!this.currentSong) {
      return;
    }
    const currPo = this.currentSong.playlistPosition;
    if (currPo > 1 && this.currentSong.howl.playing()) {
      this.playSong(this._songs[currPo - 2]);
    }
  }

  get playing(): boolean {
    return this.currentSong && this.currentSong.howl.playing();
  }
}
