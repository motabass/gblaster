import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { MetadataService } from './metadata-service/metadata.service';
import type { FrequencyBand, PlayState, RepeatMode, Track } from './player.types';
import { ALLOWED_MIMETYPES } from './file-loader-service/file-loader.helpers';
import { ThemeService } from '../theme/theme.service';
import { LoaderService } from '../services/loader/loader.service';
import { WakelockService } from '../services/wakelock.service';
import { MediaSessionService } from '../services/media-session.service';
import { AudioService } from './audio.service';
import { BaseSubscribingClass } from '@motabass/base-components/base-subscribing-component';

export const BAND_FREQUENCIES: FrequencyBand[] = [60, 170, 310, 600, 1000, 3000, 6000, 12_000, 14_000, 16_000];

@Injectable({ providedIn: 'any' })
export class PlayerService extends BaseSubscribingClass {
  private audioService = inject(AudioService);
  private fileLoaderService = inject(FileLoaderService);
  private metadataService = inject(MetadataService);
  private themeService = inject(ThemeService);
  private loaderService = inject(LoaderService);
  private wakelockService = inject(WakelockService, { optional: true });
  private mediaSessionService = inject(MediaSessionService);

  private loadFinished = true;

  currentPlaylist = signal<Track[]>([]);

  selectedTrack = signal<Track | undefined>(undefined);

  @LocalStorage('repeat', 'off') repeat!: RepeatMode;

  @LocalStorage('shuffle', false) shuffle!: boolean;

  playState = signal<PlayState>({ state: 'stopped' });

  playingTrack = computed(() => {
    const state = this.playState();
    if (state.state === 'playing' && !!state.currentTrack) {
      return state.currentTrack;
    }
    return;
  });

  constructor() {
    super();
    this.mediaSessionService.setActionHandler('play', () => this.playPause());
    this.mediaSessionService.setActionHandler('pause', () => this.playPause());
    this.mediaSessionService.setActionHandler('stop', () => this.stop());
    this.mediaSessionService.setActionHandler('nexttrack', () => this.next());
    this.mediaSessionService.setActionHandler('previoustrack', () => this.previous());
    this.mediaSessionService.setActionHandler('seekbackward', () => this.seekLeft(10));
    this.mediaSessionService.setActionHandler('seekforward', () => this.seekRight(10));
    this.mediaSessionService.setSeekToHandler((details) => this.seekToHandler(details));

    if ('launchQueue' in globalThis) {
      // @ts-expect-error
      globalThis.launchQueue.setConsumer(async (launchParameters) => {
        console.log('Handling launch params:', launchParameters);
        // Nothing to do when the queue is empty.
        if (launchParameters.files.length === 0) {
          return;
        }
        for (const fileHandle of launchParameters.files) {
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

    effect(() => {
      if (this.playState().state === 'playing' && !Number.isNaN(this.audioService.duration)) {
        this.mediaSessionService.updateMediaPositionState(this.audioService.duration, this.audioService.currentTime());
      }
    });
  }

  private afterPlayLoaded() {
    this.loadFinished = true;
    this.mediaSessionService.setPlaying();
    return this.wakelockService?.activateWakelock();
  }

  private afterPausedOrStopped() {
    this.mediaSessionService.setPaused();
    return this.wakelockService?.releaseWakelock();
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

    this.selectedTrack.set(track);
    await this.audioService.play();
    this.playState.set({ currentTrack: track, state: 'playing' });
    await this.afterPlayLoaded();
  }

  async loadFiles(): Promise<void> {
    const files: File[] = await this.fileLoaderService.openFiles();
    return this.addFilesToPlaylist(...files);
  }

  async addFilesToPlaylist(...files: File[]) {
    if (files?.length) {
      // let tempList: Track[] = [];
      // let startTime = Date.now();

      for (const [index, file] of files.entries()) {
        this.loaderService.show();
        const song = await this.createTrackFromFile(file);
        this.loaderService.hide();
        // avoid duplicate playlist entries
        if (!this.currentPlaylist().some((playlistSong) => playlistSong.metadata?.crc === song.metadata?.crc)) {
          this.currentPlaylist.update((playlist) => [...playlist, song]);
        }

        // // alle 2sek die Temporäre Liste in die sichtbare Playlist pushen
        // if (Date.now() - startTime > 2000 || i === files.length - 1) {
        //   this.currentPlaylist.update((currentList) => [...currentList, ...tempList]);
        //   if (this.selectedTrack() === undefined && this.currentPlaylist().length > 0) {
        //     this.selectSong(this.currentPlaylist()[0]);
        //   }
        //   tempList = [];
        //   startTime = Date.now();
        // }
      }
    }
  }

  private async createTrackFromFile(file: File): Promise<Track> {
    // console.time('full-metadata');
    const metadata = await this.metadataService.getMetadata(file);
    // console.timeEnd('full-metadata');
    return {
      file: file,
      metadata: metadata
    };
  }

  setSeekPosition(value: number | undefined, fastSeek = false) {
    if (value !== null && value !== undefined && value >= 0 && value <= this.durationSeconds()) {
      this.audioService.seekToPosition(value, fastSeek);
      this.mediaSessionService.updateMediaPositionState(this.audioService.duration, this.audioService.currentTime());
    }
  }

  durationSeconds = computed(() => {
    const value = this.playState();
    return value.currentTrack && value.state !== 'stopped' ? Math.round(this.audioService.duration) : 0;
  });

  currentTime = computed(() => {
    const state = this.playState();
    if (!state.currentTrack || state.state === 'stopped') {
      return 0;
    }
    const pos = this.audioService.currentTime();
    return pos !== null && pos !== undefined ? Math.floor(pos) : 0;
  });

  selectSong(song: Track) {
    this.selectedTrack.set(song);
  }

  async playPauseTrack(track: Track) {
    if (!this.loadFinished) {
      return;
    }

    if (this.playState().currentTrack === track) {
      await this.playPause();
      return;
    }

    // this.stop();

    this.loadFinished = false;
    await this.playTrack(track);
  }

  async playPause() {
    if (!this.playState().currentTrack || !this.loadFinished) {
      if (this.selectedTrack()) {
        this.loadFinished = false;
        await this.playTrack(this.selectedTrack());
      }
      return;
    }
    if (this.audioService.paused) {
      this.loadFinished = false;
      await this.audioService.play();
      this.playState.update((playstate) => ({
        state: 'playing',
        currentTrack: playstate.currentTrack
      }));
    } else {
      this.audioService.pause();
      this.playState.update((playstate) => ({
        state: 'paused',
        currentTrack: playstate.currentTrack
      }));
    }
    await this.afterPausedOrStopped();
  }

  async stop() {
    if (!this.playState().currentTrack || !this.loadFinished) {
      return;
    }
    if (this.playing()) {
      this.audioService.pause();
    }
    this.audioService.seekToPosition(0);
    this.playState.update((state) => ({ state: 'stopped', currentTrack: state.currentTrack }));
    await this.afterPausedOrStopped();
  }

  async next(): Promise<void> {
    const state = this.playState();
    if (!state.currentTrack || !this.loadFinished) {
      return;
    }

    if (this.shuffle) {
      const randomPosition = getRandomInt(0, this.currentPlaylist().length - 1);
      return this.playTrack(this.currentPlaylist()[randomPosition]);
    }

    const currentPosition = state.currentTrack.playlistPosition;
    if (!currentPosition) {
      return;
    }

    if (currentPosition < this.currentPlaylist().length) {
      return this.playTrack(this.currentPlaylist()[currentPosition]);
    } else if (this.repeat === 'all') {
      return this.playTrack(this.currentPlaylist()[0]);
    }
  }

  async previous() {
    const value = this.playState();
    if (!value.currentTrack || !this.loadFinished) {
      return;
    }
    const currentPo = value.currentTrack.playlistPosition;
    if (!currentPo) {
      return;
    }
    if (currentPo > 1) {
      return this.playTrack(this.currentPlaylist()[currentPo - 2]);
    }
  }

  selectNext() {
    if (!this.selectedTrack()) {
      return;
    }
    const currentPo = this.selectedTrack()?.playlistPosition;
    if (!currentPo) {
      return;
    }

    if (currentPo < this.currentPlaylist.length) {
      this.selectedTrack.set(this.currentPlaylist()[currentPo]);
    }
  }

  selectPrevious() {
    if (!this.selectedTrack()) {
      return;
    }
    const currentPo = this.selectedTrack()?.playlistPosition;
    if (!currentPo) {
      return;
    }

    if (currentPo > 1) {
      this.selectedTrack.set(this.currentPlaylist()[currentPo - 2]);
    }
  }

  seekLeft(seconds: number) {
    this.setSeekPosition(this.currentTime() - seconds);
  }

  seekRight(seconds: number) {
    this.setSeekPosition(this.currentTime() + seconds);
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

  playing = computed(() => !!this.playState().currentTrack && !this.audioService.paused);

  toggleRepeat() {
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

  toggleShuffle() {
    this.shuffle = !this.shuffle;
  }
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
