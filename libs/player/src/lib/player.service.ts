import { Injectable, OnInit } from '@angular/core';
import { ThemeService } from '@motabass/core/theme';
import { action, observable } from 'mobx-angular';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { MetadataService } from './metadata-service/metadata.service';
import { BandFrequency, Song, SongMetadata } from './player.types';

export const BAND_FREQUENIES: BandFrequency[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

@Injectable({ providedIn: 'any' })
export class PlayerService implements OnInit {
  bands: { [band: number]: BiquadFilterNode } = {};

  @LocalStorage('eqBandGains', { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 })
  bandGains!: { [band: number]: number };

  private audioCtx!: AudioContext;
  private gainNode!: GainNode;
  private analyserNode!: AnalyserNode;
  private audioSrcNode!: MediaElementAudioSourceNode;
  private eqInNode!: BiquadFilterNode;

  private playFinished = true;

  @observable
  songs: Song[] = [];

  @observable
  playingSong?: Song;

  audioElement!: HTMLAudioElement;

  @observable
  selectedSong?: Song;

  @LocalStorage('repeat', false)
  repeat!: boolean;
  @LocalStorage('shuffle', false)
  shuffle!: boolean;

  constructor(
    private fileLoaderService: FileLoaderService,
    private metadataService: MetadataService,
    private storageService: LocalStorageService,
    private themeService: ThemeService
  ) {
    this.initAudioElement();
    this.initAudioContext();
    this.initEqualizer();

    this.audioSrcNode = this.audioCtx.createMediaElementSource(this.audioElement);

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

  initAudioElement() {
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
    this.audioElement = audio;
  }

  initAudioContext() {
    const audioCtx = new AudioContext();

    const analyser = audioCtx.createAnalyser();
    const gainNode = audioCtx.createGain();

    analyser.connect(gainNode);

    gainNode.connect(audioCtx.destination);

    this.audioCtx = audioCtx;
    this.analyserNode = analyser;
    this.gainNode = gainNode;
  }

  initEqualizer() {
    let output: AudioNode;

    BAND_FREQUENIES.forEach((bandFrequency, i) => {
      const filter = this.audioCtx.createBiquadFilter();

      if (i === 0) {
        this.eqInNode = filter;
      }

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
      if (i > 0) {
        output?.connect(filter);
      }

      output = filter;

      if (i === BAND_FREQUENIES.length - 1) {
        output.connect(this.analyserNode);
      }
    });
  }

  setPlayingSong(song: Song | undefined) {
    if (!song) {
      return;
    }
    const oldSrc = this.audioElement.src;

    this.audioElement.src = URL.createObjectURL(song.file);

    URL.revokeObjectURL(oldSrc);

    this.playingSong = song;

    if (song.metadata) {
      this.setBrowserMetadata(song.metadata);

      const primaryColor = song.metadata.coverColors?.darkVibrant?.hex;
      this.themeService.setPrimaryColor(primaryColor);

      const accentColor = song.metadata.coverColors?.lightVibrant?.hex;
      this.themeService.setAccentColor(accentColor);
    }

    if (!this.audioCtx) {
      this.initAudioContext();
      this.initEqualizer();
    }

    this.audioSrcNode.connect(this.eqInNode);
  }

  async loadFolder() {
    const newFolder: boolean = await this.fileLoaderService.openFolder();
    if (newFolder) {
      const files = await this.fileLoaderService.getFiles();
      this.songs = [];
      for (const file of files) {
        const song = await this.createSongFromFile(file);
        this.songs.push(song);
      }
    }
  }

  private async createSongFromFile(file: File): Promise<Song> {
    const song: Song = {
      file: file
    };
    song.metadata = await this.metadataService.getMetadata(file);
    return song;
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

  @action
  setVolume(value: number) {
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

  @action
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

  @action
  selectSong(song: Song) {
    this.selectedSong = song;
  }

  @action
  playPauseSong(song: Song) {
    if (!this.playFinished) {
      return;
    }

    if (this.playingSong && song === this.playingSong) {
      this.playPause();
      return;
    }

    this.stop();

    this.setPlayingSong(song);

    this.playFinished = false;
    this.audioElement.play().then(() => (this.playFinished = true));
  }

  @action
  playPause() {
    if (!this.playingSong || !this.playFinished) {
      if (this.selectedSong) {
        this.setPlayingSong(this.selectedSong);
        this.playFinished = false;
        this.audioElement.play().then(() => (this.playFinished = true));
      }
      return;
    }
    if (this.audioElement.paused) {
      this.playFinished = false;
      this.audioElement.play().then(() => (this.playFinished = true));
    } else {
      this.audioElement.pause();
    }
  }

  @action
  stop() {
    if (!this.playingSong || !this.playFinished) {
      return;
    }
    if (this.playing) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    } else {
      this.audioElement.currentTime = 0;
    }
  }

  @action
  async next(): Promise<void> {
    if (!this.playingSong || !this.playFinished) {
      return;
    }
    const currPo = this.playingSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this.songs.length) {
      return this.playPauseSong(this.songs[currPo]);
    }
  }

  @action
  async previous() {
    if (!this.playingSong || !this.playFinished) {
      return;
    }
    const currPo = this.playingSong.playlistPosition;
    if (!currPo) {
      return;
    }
    if (currPo > 1) {
      return this.playPauseSong(this.songs[currPo - 2]);
    }
  }

  @action
  selectNext() {
    if (!this.selectedSong) {
      return;
    }
    const currPo = this.selectedSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this.songs.length) {
      this.selectedSong = this.songs[currPo];
    }
  }

  @action
  selectPrevious() {
    if (!this.selectedSong) {
      return;
    }
    const currPo = this.selectedSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo > 1) {
      this.selectedSong = this.songs[currPo - 2];
    }
  }

  get playing(): boolean {
    return !!this.playingSong && !this.audioElement.paused;
  }

  @action
  toggleRepeat() {
    if (!this.repeat) {
      this.audioElement.loop = true;
      this.repeat = true;
    } else {
      this.audioElement.loop = false;
      this.repeat = false;
    }
  }

  @action
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
