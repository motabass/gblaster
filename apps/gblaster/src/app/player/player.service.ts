import { Injectable } from '@angular/core';
import { action, observable } from 'mobx-angular';
import { LocalStorage } from 'ngx-webstorage';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { MetadataService } from './metadata-service/metadata.service';
import { FrequencyBand, PlayState, RepeatMode, Track } from './player.types';
import { ALLOWED_MIMETYPES } from './file-loader-service/file-loader.helpers';
import { ThemeService } from '../theme/theme.service';
import { LoaderService } from '../services/loader/loader.service';
import { WakelockService } from '../services/wakelock.service';
import { MediaSessionService } from '../services/media-session.service';
import { AudioService } from './audio.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseSubscribingClass } from '@motabass/base-components/base-subscribing-component';
import { takeUntil } from 'rxjs/operators';

export const BAND_FREQUENCIES: FrequencyBand[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

@Injectable({ providedIn: 'any' })
export class PlayerService extends BaseSubscribingClass {
  private playState: BehaviorSubject<PlayState> = new BehaviorSubject<PlayState>({ state: 'stopped' });

  private loadFinished = true;

  @observable currentPlaylist: Track[] = [];

  @observable selectedTrack?: Track;

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
    super();
    this.mediaSessionService.setActionHandler('play', () => this.playPause());
    this.mediaSessionService.setActionHandler('pause', () => this.playPause());
    this.mediaSessionService.setActionHandler('stop', () => this.stop());
    this.mediaSessionService.setActionHandler('nexttrack', () => this.next());
    this.mediaSessionService.setActionHandler('previoustrack', () => this.previous());
    this.mediaSessionService.setActionHandler('seekbackward', () => this.seekLeft(10));
    this.mediaSessionService.setActionHandler('seekforward', () => this.seekRight(10));
    this.mediaSessionService.setSeekToHandler((details) => this.seekToHandler(details));

    if ('launchQueue' in window) {
      // @ts-expect-error
      window.launchQueue.setConsumer(async (launchParams) => {
        console.log('Handling launch params:', launchParams);
        // Nothing to do when the queue is empty.
        if (launchParams.files.length === 0) {
          return;
        }
        for (const fileHandle of launchParams.files) {
          const file = await fileHandle.getFile();
          if (ALLOWED_MIMETYPES.includes(file.type)) {
            await this.addFilesToPlaylist(file);
          }
        }
      });
    }

    this.audioService.setOnEnded(() => {
      void this.next();
    });

    this.playState.pipe(takeUntil(this.destroy$)).subscribe(async (state) => {
      if (state.state === 'playing') {
        await this.afterPlayLoaded();
      }

      if (state.state === 'paused' || state.state === 'stopped') {
        await this.afterPausedOrStopped();
      }
    });
  }

  private afterPlayLoaded() {
    this.loadFinished = true;
    this.mediaSessionService.setPlaying();
    this.mediaSessionService.updateMediaPositionState(this.audioService.duration, this.audioService.currentTime);
    return this.wakelockService.activateWakelock();
  }

  private afterPausedOrStopped() {
    this.mediaSessionService.setPaused();
    return this.wakelockService.releaseWakelock();
  }

  private async playTrack(track: Track | undefined) {
    if (!track) {
      return;
    }
    this.audioService.setFileAsSource(track.file);

    if (track.metadata) {
      this.mediaSessionService.setBrowserMetadata({
        title: track.metadata.title,
        artist: track.metadata.artist,
        album: track.metadata.album,
        artwork: track.metadata.coverUrl?.original ? [{ src: track.metadata.coverUrl.original, sizes: '512x512' }] : undefined
      });

      const primaryColor = track.metadata.coverColors?.darkVibrant?.hex;
      this.themeService.setPrimaryColor(primaryColor);

      const accentColor = track.metadata.coverColors?.vibrant?.hex;
      this.themeService.setAccentColor(accentColor);
    }

    this.selectedTrack = track;
    await this.audioService.play();
    this.playState.next({ currentTrack: track, state: 'playing' });
  }

  get playState$(): Observable<PlayState> {
    return this.playState.asObservable();
  }

  @action async loadFiles(): Promise<void> {
    const files: File[] = await this.fileLoaderService.openFiles();
    return this.addFilesToPlaylist(...files);
  }

  @action async addFilesToPlaylist(...files: File[]) {
    if (files?.length) {
      let tempList: Track[] = [];
      let startTime = Date.now();

      for (const [i, file] of files.entries()) {
        this.loaderService.show();
        const song = await this.createTrackFromFile(file);
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

  private async createTrackFromFile(file: File): Promise<Track> {
    console.time('full-metadata');
    const metadata = await this.metadataService.getMetadata(file);
    console.timeEnd('full-metadata');
    return {
      file: file,
      metadata: metadata
    };
  }

  @action setSeekPosition(value: number | undefined, fastSeek = false) {
    if (value !== null && value !== undefined && value >= 0 && value <= this.durationSeconds) {
      this.audioService.seekToPosition(value, fastSeek);
      this.mediaSessionService.updateMediaPositionState(this.audioService.duration, this.audioService.currentTime);
    }
  }

  get durationSeconds(): number {
    const value = this.playState.getValue();
    return value.currentTrack && value.state !== 'stopped' ? Math.round(this.audioService.duration) : 0;
  }

  getCurrentTime(): number {
    const value = this.playState.getValue();
    if (!value.currentTrack || value.state === 'stopped') {
      return 0;
    }
    const pos = this.audioService.currentTime;
    return pos !== null && pos !== undefined ? Math.floor(pos) : 0;
  }

  @action selectSong(song: Track) {
    this.selectedTrack = song;
  }

  async playPauseTrack(track: Track) {
    if (!this.loadFinished) {
      return;
    }

    if (this.playState.getValue().currentTrack === track) {
      await this.playPause();
      return;
    }

    // this.stop();

    this.loadFinished = false;
    await this.playTrack(track);
  }

  async playPause() {
    if (!this.playState.getValue().currentTrack || !this.loadFinished) {
      if (this.selectedTrack) {
        this.loadFinished = false;
        await this.playTrack(this.selectedTrack);
      }
      return;
    }
    if (this.audioService.paused) {
      this.loadFinished = false;
      await this.audioService.play();
      this.playState.next({ state: 'playing', currentTrack: this.playState.getValue().currentTrack });
    } else {
      this.audioService.pause();
      this.playState.next({ state: 'paused', currentTrack: this.playState.getValue().currentTrack });
    }
  }

  @action stop() {
    if (!this.playState.getValue().currentTrack || !this.loadFinished) {
      return;
    }
    if (this.playing) {
      this.audioService.pause();
    }
    this.audioService.seekToPosition(0);
    this.playState.next({ state: 'stopped', currentTrack: this.playState.getValue().currentTrack });
  }

  @action async next(): Promise<void> {
    const value = this.playState.getValue();
    if (!value.currentTrack || !this.loadFinished) {
      return;
    }

    if (this.shuffle) {
      const randomPosition = getRandomInt(0, this.currentPlaylist.length - 1);
      return this.playTrack(this.currentPlaylist[randomPosition]);
    }

    const currPo = value.currentTrack.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this.currentPlaylist.length) {
      return this.playTrack(this.currentPlaylist[currPo]);
    } else if (this.repeat === 'all') {
      return this.playTrack(this.currentPlaylist[0]);
    }
  }

  @action async previous() {
    const value = this.playState.getValue();
    if (!value.currentTrack || !this.loadFinished) {
      return;
    }
    const currPo = value.currentTrack.playlistPosition;
    if (!currPo) {
      return;
    }
    if (currPo > 1) {
      return this.playTrack(this.currentPlaylist[currPo - 2]);
    }
  }

  @action selectNext() {
    if (!this.selectedTrack) {
      return;
    }
    const currPo = this.selectedTrack.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo < this.currentPlaylist.length) {
      this.selectedTrack = this.currentPlaylist[currPo];
    }
  }

  @action selectPrevious() {
    if (!this.selectedTrack) {
      return;
    }
    const currPo = this.selectedTrack.playlistPosition;
    if (!currPo) {
      return;
    }

    if (currPo > 1) {
      this.selectedTrack = this.currentPlaylist[currPo - 2];
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
    return !!this.playState.getValue().currentTrack && !this.audioService.paused;
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
