import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { MetadataService } from './metadata-service/metadata.service';
import type { ColorConfig, RepeatMode, Track } from './player.types';
import { ALLOWED_MIMETYPES } from './file-loader-service/file-loader.helpers';
import { ThemeService } from '../theme/theme.service';
import { LoaderService } from '../services/loader/loader.service';
import { WakelockService } from '../services/wakelock.service';
import { MediaSessionService } from '../services/media-session/media-session.service';
import { AudioService } from './audio.service';
import { BaseSubscribingClass } from '@motabass/base-components/base-subscribing-component';
import { takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'any' })
export class PlayerService extends BaseSubscribingClass {
  private audioService = inject(AudioService);
  private localStorageService = inject(LocalStorageService);
  private fileLoaderService = inject(FileLoaderService);
  private metadataService = inject(MetadataService);
  private themeService = inject(ThemeService);
  private loaderService = inject(LoaderService);
  private wakelockService = inject(WakelockService, { optional: true });
  private mediaSessionService = inject(MediaSessionService, { optional: true });

  readonly currentPlaylist = signal<Track[]>([]);

  readonly selectedTrack = signal<Track | undefined>(undefined);

  readonly currentlyLoadedTrack = signal<Track | undefined>(undefined);

  // TODO: Signal mit param track????
  // readonly playingTrack = computed(() => {
  //   const track = this.currentlyLoadedTrack();
  //   if (track && this.audioService.isPlaying()) {
  //     return track;
  //   }
  //   return;
  // });

  readonly repeat = signal<RepeatMode>(this.localStorageService.retrieve('repeat') || 'off');
  readonly shuffle = signal<boolean>(this.localStorageService.retrieve('shuffle') ?? false);

  readonly colorConfig = computed<ColorConfig>(() => {
    const coverColors = this.currentlyLoadedTrack()?.metadata?.coverColors;
    const mainColor = coverColors?.darkVibrant?.hex;
    const peakColor = coverColors?.lightVibrant?.hex;
    return { mainColor: mainColor, peakColor: peakColor };
  });

  constructor() {
    super();
    if (this.mediaSessionService) {
      this.mediaSessionService.setActionHandler('play', () => this.playPause());
      this.mediaSessionService.setActionHandler('pause', () => this.playPause());
      this.mediaSessionService.setActionHandler('stop', () => this.stop());
      this.mediaSessionService.setActionHandler('nexttrack', () => this.next());
      this.mediaSessionService.setActionHandler('previoustrack', () => this.previous());
      this.mediaSessionService.setActionHandler('seekbackward', () => this.seekLeft(10));
      this.mediaSessionService.setActionHandler('seekforward', () => this.seekRight(10));
      this.mediaSessionService.setSeekToHandler((details) => this.seekToHandler(details));
    }

    // TODO: überarbeiten
    if ('launchQueue' in globalThis) {
      // @ts-expect-error launchQueue is not yet in TS types
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

    this.audioService.hasEnded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      void this.next();
    });

    effect(() => {
      this.themeService.setColors(this.colorConfig());
    });
  }

  private afterPlayLoaded() {
    return this.wakelockService?.activateWakelock();
  }

  private afterPausedOrStopped() {
    return this.wakelockService?.releaseWakelock();
  }

  private async playTrack(track: Track | undefined) {
    if (!track) {
      return;
    }
    this.selectSong(track);
    this.audioService.setFileAsSource(track.file);
    if (track.metadata && this.mediaSessionService) {
      this.mediaSessionService.setBrowserMetadata({
        title: track.metadata.title,
        artist: track.metadata.artist,
        album: track.metadata.album,
        artwork: track.metadata.coverUrl?.original ? [{ src: track.metadata.coverUrl.original, sizes: '512x512' }] : undefined
      });
    }
    await this.audioService.play();
    this.currentlyLoadedTrack.set(track);
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
    }
  }

  readonly durationSeconds = computed(() => {
    return this.currentlyLoadedTrack() && !this.audioService.isStopped() ? Math.round(this.audioService.duration()) : 0;
  });

  readonly currentTime = computed(() => {
    if (!this.currentlyLoadedTrack() || this.audioService.isStopped()) {
      return 0;
    }
    const pos = this.audioService.currentTime();
    return pos !== null && pos !== undefined ? Math.floor(pos) : 0;
  });

  selectSong(song: Track) {
    this.selectedTrack.set(song);
  }

  async playPauseTrack(track: Track) {
    if (this.audioService.isLoading()) {
      return;
    }

    if (this.currentlyLoadedTrack()?.metadata?.crc === track.metadata?.crc) {
      await this.playPause();
      return;
    }
    await this.playTrack(track);
  }

  async playPause() {
    if (this.audioService.isLoading() || !this.currentlyLoadedTrack()) {
      if (this.selectedTrack()) {
        await this.playTrack(this.selectedTrack());
      }
      return;
    }
    if (this.audioService.isPaused()) {
      await this.audioService.play();
      await this.afterPlayLoaded();
    } else {
      this.audioService.pause();
      await this.afterPausedOrStopped();
    }
  }

  async stop() {
    if (this.audioService.isLoading() || !this.currentlyLoadedTrack()) {
      return;
    }
    this.audioService.stop();
    this.currentlyLoadedTrack.set(undefined);
    await this.afterPausedOrStopped();
  }

  async next(): Promise<void> {
    if (this.audioService.isLoading() || !this.currentlyLoadedTrack()) {
      return;
    }

    if (this.shuffle()) {
      const randomPosition = getRandomInt(0, this.currentPlaylist().length - 1);
      return this.playTrack(this.currentPlaylist()[randomPosition]);
    }

    const currentPosition = this.currentlyLoadedTrack()?.playlistPosition;
    if (!currentPosition) {
      return;
    }

    if (currentPosition < this.currentPlaylist().length) {
      return this.playTrack(this.currentPlaylist()[currentPosition]);
    } else if (this.repeat() === 'all') {
      return this.playTrack(this.currentPlaylist()[0]);
    }
  }

  async previous() {
    if (this.audioService.isLoading() || !this.currentlyLoadedTrack()) {
      return;
    }
    const currentPo = this.currentlyLoadedTrack()?.playlistPosition;
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

  toggleRepeat() {
    switch (this.repeat()) {
      case 'off': {
        this.repeat.set('all');
        break;
      }
      case 'all': {
        this.audioService.setLoop(true);
        this.repeat.set('one');
        break;
      }
      case 'one': {
        this.audioService.setLoop(false);
        this.repeat.set('off');
        break;
      }
    }
  }

  toggleShuffle() {
    this.shuffle.set(!this.shuffle());
  }
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
