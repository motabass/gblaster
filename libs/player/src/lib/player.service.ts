import { Injectable } from '@angular/core';
import { MetadataService } from './metadata.service';
import { NativeFileLoaderService } from './native-file-loader.service';
import { Song, SongMetadata } from './player.types';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audioCtx: AudioContext;
  private gainNode: GainNode;
  private analyserNode: AnalyserNode;
  private audioSrcNode: MediaElementAudioSourceNode;

  get songs(): Song[] {
    return this._songs;
  }

  set songs(songs: Song[]) {
    this._songs = songs;
  }
  private _songs: Song[] = [];

  currentSong: Song;

  audioElement: HTMLAudioElement;

  constructor(private fileLoaderService: NativeFileLoaderService, private metadataService: MetadataService) {
    this.initialzeAudioNodes();
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

  initialzeAudioNodes() {
    const audio = new Audio();
    audio.loop = false;
    audio.autoplay = false;
    audio.controls = false;
    audio.preload = 'metadata';

    this.audioCtx = new AudioContext();

    const analyser = this.audioCtx.createAnalyser();
    const gainNode = this.audioCtx.createGain();

    gainNode.gain.value = 0.7;

    analyser.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    this.analyserNode = analyser;
    this.gainNode = gainNode;
    this.audioElement = audio;
    this.audioSrcNode = this.audioCtx.createMediaElementSource(this.audioElement);
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
    const url = URL.createObjectURL(file);
    return {
      // howl: this.howlerService.createHowlFromFile(file),
      url: url,
      fileHandle: fileHandle,
      metadata: metadata
    };
  }

  set volume(value: number) {
    this.gainNode.gain.value = value;
  }

  get volume() {
    return this.gainNode.gain.value;
  }

  get analyser(): AnalyserNode {
    return this.analyserNode;
  }

  setSeekPosition(sliderValue) {
    // this.currentSong.howl.seek(sliderValue);
    this.audioElement.currentTime = sliderValue;
  }

  get durationSeconds(): number {
    // return this.currentSong ? Math.round(this.currentSong.howl.duration()) : 0;
    return this.currentSong ? Math.round(this.audioElement.duration) : 0;
  }

  get currentTime(): number {
    if (!this.currentSong) {
      return 0;
    }
    const pos = this.audioElement.currentTime;
    if (pos !== null && pos !== undefined) {
      return Math.floor(pos);
    } else {
      return 0;
    }
  }

  async playPauseSong(song: Song): Promise<void> {
    if (this.currentSong && song === this.currentSong) {
      this.playPause();
      return;
    }

    this.stop();

    this.audioElement.src = song.url;
    this.currentSong = song;

    this.setBrowserMetadata(song.metadata);

    this.audioSrcNode.connect(this.analyserNode);

    return this.audioElement.play();
  }

  playPause() {
    if (!this.currentSong) {
      return;
    }
    if (this.audioElement.paused) {
      this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  stop() {
    if (!this.currentSong) {
      return;
    }
    if (this.playing) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    } else {
      this.audioElement.currentTime = 0;
    }
  }

  next() {
    if (!this.currentSong) {
      return;
    }
    const currPo = this.currentSong.playlistPosition;
    if (currPo < this._songs.length && this.playing) {
      this.playPauseSong(this._songs[currPo]);
    }
  }

  previous() {
    if (!this.currentSong) {
      return;
    }
    const currPo = this.currentSong.playlistPosition;
    if (currPo > 1 && this.playing) {
      this.playPauseSong(this._songs[currPo - 2]);
    }
  }

  get playing(): boolean {
    return this.currentSong && !this.audioElement.paused;
  }

  // startPositionReporter(song: Song) {
  //   if ('mediaSession' in navigator) {
  //     const positionInterval = setInterval(() => {
  //       if (song.howl.playing()) {
  //         // @ts-ignore
  //         navigator.mediaSession.setPositionState({
  //           duration: song.howl.duration(),
  //           playbackRate: 1,
  //           position: song.howl.seek() as number
  //         });
  //       } else {
  //         window.clearInterval(positionInterval);
  //       }
  //     }, 1000);
  //   }
  // }

  setBrowserMetadata(metadata: SongMetadata) {
    if ('mediaSession' in navigator) {
      // @ts-ignore
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        artwork: [{ src: metadata.coverUrl, sizes: '512x512' }]
      });
    }
  }
}
