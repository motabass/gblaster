import { Injectable, OnInit } from '@angular/core';
import { ThemeService } from '@motabass/core/theme';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { MetadataService } from './metadata-service/metadata.service';
import { NativeFileLoaderService } from './native-file-loader.service';
import { BandFrequency, Song, SongMetadata } from './player.types';

export const BAND_FREQUENIES: BandFrequency[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

@Injectable()
export class PlayerService implements OnInit {
  bands: { [band: number]: BiquadFilterNode } = {};

  @LocalStorage('eqBandGains', { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 })
  bandGains!: { [band: number]: number };

  private audioCtx: AudioContext;
  private gainNode: GainNode;
  private readonly analyserNode: AnalyserNode;
  private audioSrcNode: MediaElementAudioSourceNode;

  private _songs: Song[] = [];
  get songs(): Song[] {
    return this._songs;
  }
  set songs(songs: Song[]) {
    this._songs = songs;
  }

  private _playingSong?: Song;
  get playingSong(): Song | undefined {
    return this._playingSong;
  }
  set playingSong(song: Song | undefined) {
    if (!song) {
      return;
    }
    this.audioElement.src = song.url;
    this._playingSong = song;

    this.setBrowserMetadata(song.metadata);

    const primaryColor = song.metadata.coverColors?.DarkVibrant?.getHex();
    this.themeService.setPrimaryColor(primaryColor);

    const accentColor = song.metadata.coverColors?.LightVibrant?.getHex();
    this.themeService.setAccentColor(accentColor);

    this.audioSrcNode.connect(this.analyserNode);
  }

  audioElement: HTMLAudioElement;

  selectedSong?: Song;

  @LocalStorage('repeat', false)
  repeat!: boolean;
  @LocalStorage('shuffle', false)
  shuffle!: boolean;

  constructor(
    private fileLoaderService: NativeFileLoaderService,
    private metadataService: MetadataService,
    private storageService: LocalStorageService,
    private themeService: ThemeService
  ) {
    const audio = new Audio();
    audio.loop = false;
    audio.autoplay = false;
    audio.controls = false;
    audio.preload = 'metadata';
    audio.onended = () => {
      console.log('ended');
      this.next();
    };
    audio.onerror = (e) => {
      console.error(e);
    };

    this.audioCtx = new AudioContext();

    const analyser = this.audioCtx.createAnalyser();
    const gainNode = this.audioCtx.createGain();

    gainNode.connect(this.audioCtx.destination);

    this.analyserNode = analyser;
    this.gainNode = gainNode;
    this.audioElement = audio;
    this.audioSrcNode = this.audioCtx.createMediaElementSource(this.audioElement);

    this.initEqualizer();

    this.gainNode.gain.value = storageService.retrieve('volume');

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

  ngOnInit(): void {
    BAND_FREQUENIES.forEach((bandFrequency) => {
      const filter = this.bands[bandFrequency];
      filter.gain.value = this.bandGains[bandFrequency];
    });
  }

  initEqualizer() {
    let output: AudioNode = this.analyserNode;

    BAND_FREQUENIES.forEach((bandFrequency, i) => {
      const filter = this.audioCtx.createBiquadFilter();

      this.bands[bandFrequency] = filter;

      if (i === 0) {
        // The first filter, includes all lower frequencies
        filter.type = 'lowshelf';
      } else if (i === BAND_FREQUENIES.length - 1) {
        // The last filter, includes all higher frequencies
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
      }
      filter.frequency.value = bandFrequency;
      filter.gain.value = 0;

      output.connect(filter);
      output = filter;
    });

    output.connect(this.gainNode);
  }

  async loadFolder() {
    const newFolder: boolean = await this.fileLoaderService.openFolder();
    if (newFolder) {
      const fileHandles = this.fileLoaderService.currentFolderFileHandles;
      this.songs = [];
      for (const fileHandle of fileHandles) {
        const song = await this.createSongFromFileHandle(fileHandle);
        this.songs.push(song);
      }
    }
  }

  private async createSongFromFileHandle(fileHandle: any): Promise<Song> {
    const file = await fileHandle.getFile();
    const metadata: SongMetadata = await this.metadataService.getMetadata(file);
    const url = URL.createObjectURL(file);
    return {
      url: url,
      type: file.type,
      fileHandle: fileHandle,
      metadata: metadata
    };
  }

  getBandGain(bandFrequency: BandFrequency): number {
    return this.bandGains[bandFrequency];
  }

  setBandGain(bandFrequency: BandFrequency, gainValue: number) {
    this.bands[bandFrequency].gain.value = gainValue;

    const bandGains = this.bandGains;
    bandGains[bandFrequency] = gainValue;
    this.bandGains = bandGains;
  }

  set volume(value: number) {
    if (value >= 0 && value <= 1) {
      this.storageService.store('volume', value);
      this.gainNode.gain.value = value;
    }
  }

  get volume() {
    return this.gainNode.gain.value;
  }

  get analyser(): AnalyserNode {
    return this.analyserNode;
  }

  setSeekPosition(value: number) {
    if (value !== null && value !== undefined && value >= 0 && value <= this.durationSeconds) {
      this.audioElement.currentTime = value;
    }
  }

  get durationSeconds(): number {
    return this.playingSong ? Math.round(this.audioElement.duration) : 0;
  }

  get currentTime(): number {
    if (!this.playingSong) {
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
    if (this.playingSong && song === this.playingSong) {
      this.playPause();
      return;
    }

    this.stop();

    this.playingSong = song;

    return this.audioElement.play();
  }

  async playPause(): Promise<void> {
    if (!this.playingSong) {
      return;
    }
    if (this.audioElement.paused) {
      return this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  stop() {
    if (!this.playingSong) {
      return;
    }
    if (this.playing) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    } else {
      this.audioElement.currentTime = 0;
    }
  }

  async next(): Promise<void> {
    if (!this.playingSong) {
      return;
    }
    const currPo = this.playingSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this._songs.length) {
      return this.playPauseSong(this._songs[currPo]);
    }
  }

  async previous() {
    if (!this.playingSong) {
      return;
    }
    const currPo = this.playingSong.playlistPosition;
    if (!currPo) {
      return;
    }
    if (currPo > 1) {
      return this.playPauseSong(this._songs[currPo - 2]);
    }
  }

  selectNext() {
    if (!this.selectedSong) {
      return;
    }
    const currPo = this.selectedSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this._songs.length) {
      this.selectedSong = this._songs[currPo];
    }
  }

  selectPrevious() {
    if (!this.selectedSong) {
      return;
    }
    const currPo = this.selectedSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo > 1) {
      this.selectedSong = this._songs[currPo - 2];
    }
  }

  get playing(): boolean {
    return !!this.playingSong && !this.audioElement.paused;
  }

  toggleRepeat() {
    if (!this.repeat) {
      this.audioElement.loop = true;
      this.repeat = true;
    } else {
      this.audioElement.loop = false;
      this.repeat = false;
    }
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
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
