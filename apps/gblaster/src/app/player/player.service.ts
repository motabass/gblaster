import { Injectable } from '@angular/core';
import { action, observable } from 'mobx-angular';
import { LocalStorage } from 'ngx-webstorage';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { MetadataService } from './metadata-service/metadata.service';
import { FrequencyBand, RepeatMode, Song } from './player.types';
import { ALLOWED_MIMETYPES } from './file-loader-service/file-loader.helpers';
import { ThemeService } from '../theme/theme.service';
import { LoaderService } from '../services/loader/loader.service';
import { WakelockService } from '../services/wakelock.service';
import { MediaSessionService } from '../services/media-session.service';
import { AudioService } from './audio.service';

export const BAND_FREQUENIES: FrequencyBand[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

@Injectable({ providedIn: 'any' })
export class PlayerService {
  private loadFinished = true;

  @observable currentPlaylist: Song[] = [];

  @observable playingSong?: Song;

  @observable selectedSong?: Song;

  @LocalStorage('repeat', 'off') repeat!: RepeatMode;

  @LocalStorage('shuffle', false) shuffle!: boolean;

  constructor(
    private audioService: AudioService,
    private fileLoaderService: FileLoaderService,
    private metadataService: MetadataService,
    private themeService: ThemeService,
    private loaderService: LoaderService,
    private wakelockService: WakelockService,
    private mediaSessionService: MediaSessionService
  ) {
    this.mediaSessionService.setActionHandler('play', () => this.playPause());
    this.mediaSessionService.setActionHandler('pause', () => this.playPause());
    this.mediaSessionService.setActionHandler('stop', () => this.stop());
    this.mediaSessionService.setActionHandler('nexttrack', () => this.next());
    this.mediaSessionService.setActionHandler('previoustrack', () => this.previous());
    this.mediaSessionService.setActionHandler('seekbackward', () => this.seekLeft(10));
    this.mediaSessionService.setActionHandler('seekforward', () => this.seekRight(10));
    this.mediaSessionService.setSeekToHandler((details) => this.seekToHandler(details));

    if ('launchQueue' in window) {
      // @ts-ignore
      window.launchQueue.setConsumer(async (launchParams) => {
        console.log('Handling launch params:', launchParams);
        // Nothing to do when the queue is empty.
        if (launchParams.files.length === 0) {
          return;
        }
        for (const fileHandle of launchParams.files) {
          const file = await fileHandle.getFile();
          if (ALLOWED_MIMETYPES.includes(file.type)) {
            await this.addToPlaylist(file);
          }
        }
      });
    }

    this.audioService.setOnEnded(() => {
      this.next();
    });
  }

  private async setPlayingSong(song: Song | undefined) {
    if (!song) {
      return;
    }
    this.audioService.setFileAsSource(song.file);

    this.playingSong = song;

    if (song.metadata) {
      this.mediaSessionService.setBrowserMetadata({
        title: song.metadata.title,
        artist: song.metadata.artist,
        album: song.metadata.album,
        artwork: song.metadata.coverUrl?.original ? [{ src: song.metadata.coverUrl.original, sizes: '512x512' }] : undefined
      });

      const primaryColor = song.metadata.coverColors?.darkVibrant?.hex;
      this.themeService.setPrimaryColor(primaryColor);

      const accentColor = song.metadata.coverColors?.vibrant?.hex;
      this.themeService.setAccentColor(accentColor);
    }

    // TODO: ???????????????????
    // if (this.audioCtx.state === 'suspended') {
    //   await this.audioCtx.resume();
    // }

    this.selectedSong = song;
  }

  @action async loadFiles(): Promise<void> {
    const files: File[] = await this.fileLoaderService.openFiles();
    return this.addToPlaylist(...files);
  }

  @action async addToPlaylist(...files: File[]) {
    if (files?.length) {
      let tempList: Song[] = [];
      let startTime = Date.now();

      for (const [i, file] of files.entries()) {
        this.loaderService.show();
        const song = await this.createSongFromFile(file);
        this.loaderService.hide();
        // avoid duplicate playlist entries
        if (!this.currentPlaylist.some((playlistSong) => playlistSong.metadata?.crc === song.metadata?.crc)) {
          tempList.push(song);
        }

        // alle 2sek die Temporäre Liste in die sichtbare Playlist pushen
        if (Date.now() - startTime > 2000 || i === files.length - 1) {
          this.currentPlaylist.push(...tempList);
          tempList = [];
          startTime = Date.now();
        }
      }
    }
  }

  private async createSongFromFile(file: File): Promise<Song> {
    const song: Song = {
      file: file
    };
    console.time('full-metadata');
    song.metadata = await this.metadataService.getMetadata(file);
    console.timeEnd('full-metadata');
    return song;
  }

  @action setSeekPosition(value: number | undefined, fastSeek = false) {
    if (value !== null && value !== undefined && value >= 0 && value <= this.durationSeconds) {
      this.audioService.seekToPosition(value, fastSeek);
      this.mediaSessionService.updateMediaPositionState(this.audioService.duration, this.audioService.currentTime);
    }
  }

  get durationSeconds(): number {
    return this.playingSong ? Math.round(this.audioService.duration) : 0;
  }

  getCurrentTime(): number {
    if (!this.playingSong) {
      return 0;
    }
    const pos = this.audioService.currentTime;
    return pos !== null && pos !== undefined ? Math.floor(pos) : 0;
  }

  @action selectSong(song: Song) {
    this.selectedSong = song;
  }

  @action playPauseSong(song: Song) {
    if (!this.loadFinished) {
      return;
    }

    if (this.playingSong && song === this.playingSong) {
      this.playPause();
      return;
    }

    // this.stop();

    this.loadFinished = false;
    this.setPlayingSong(song);
    this.audioService.play().then(() => this.afterPlayLoaded());
  }

  afterPlayLoaded() {
    this.loadFinished = true;
    this.mediaSessionService.setPlaying();
    this.mediaSessionService.updateMediaPositionState(this.audioService.duration, this.audioService.currentTime);
    this.wakelockService.activateWakelock();
  }

  @action playPause() {
    if (!this.playingSong || !this.loadFinished) {
      if (this.selectedSong) {
        this.loadFinished = false;
        this.setPlayingSong(this.selectedSong);
        this.audioService.play().then(() => this.afterPlayLoaded());
      }
      return;
    }
    if (this.audioService.paused) {
      this.loadFinished = false;
      this.audioService.play().then(() => this.afterPlayLoaded());
    } else {
      this.audioService.pause();
      this.mediaSessionService.setPaused();
      this.wakelockService.releaseWakelock();
    }
  }

  @action stop() {
    if (!this.playingSong || !this.loadFinished) {
      return;
    }
    if (this.playing) {
      this.audioService.pause();
      this.mediaSessionService.setPaused();
    }
    this.audioService.seekToPosition(0);

    this.wakelockService.releaseWakelock();
  }

  @action async next(): Promise<void> {
    if (!this.playingSong || !this.loadFinished) {
      return;
    }

    if (this.shuffle) {
      const randomPosition = getRandomInt(0, this.currentPlaylist.length - 1);
      return this.playPauseSong(this.currentPlaylist[randomPosition]);
    }

    const currPo = this.playingSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this.currentPlaylist.length) {
      return this.playPauseSong(this.currentPlaylist[currPo]);
    } else if (this.repeat === 'all') {
      return this.playPauseSong(this.currentPlaylist[0]);
    }
  }

  @action async previous() {
    if (!this.playingSong || !this.loadFinished) {
      return;
    }
    const currPo = this.playingSong.playlistPosition;
    if (!currPo) {
      return;
    }
    if (currPo > 1) {
      return this.playPauseSong(this.currentPlaylist[currPo - 2]);
    }
  }

  @action selectNext() {
    if (!this.selectedSong) {
      return;
    }
    const currPo = this.selectedSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this.currentPlaylist.length) {
      this.selectedSong = this.currentPlaylist[currPo];
    }
  }

  @action selectPrevious() {
    if (!this.selectedSong) {
      return;
    }
    const currPo = this.selectedSong.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo > 1) {
      this.selectedSong = this.currentPlaylist[currPo - 2];
    }
  }

  seekLeft(seconds: number) {
    this.setSeekPosition(this.getCurrentTime() - seconds);
  }

  seekRight(seconds: number) {
    this.setSeekPosition(this.getCurrentTime() + seconds);
  }

  private seekToHandler(details: MediaSessionActionDetails) {
    if (details.seekTime) {
      if (details.fastSeek) {
        this.setSeekPosition(details.seekTime, true);
      } else {
        this.setSeekPosition(details.seekTime);
      }
    }
  }

  get playing(): boolean {
    return !!this.playingSong && !this.audioService.paused;
  }

  @action toggleRepeat() {
    switch (this.repeat) {
      case 'off': {
        this.repeat = 'all';
        break;
      }
      case 'all': {
        this.audioService.setLoop(true);
        this.repeat = 'one';
        break;
      }
      case 'one': {
        this.audioService.setLoop(false);
        this.repeat = 'off';
        break;
      }
    }
  }

  @action toggleShuffle() {
    this.shuffle = !this.shuffle;
  }
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
