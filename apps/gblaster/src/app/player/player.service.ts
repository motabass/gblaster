import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { MetadataService } from './metadata-service/metadata.service';
import type { ColorConfig, RepeatMode, Track } from './player.types';
import { ALLOWED_MIMETYPES, FileData } from './file-loader-service/file-loader.helpers';
import { ThemeService } from '../theme/theme.service';
import { WakelockService } from '../services/wakelock.service';
import { MediaSessionService } from '../services/media-session/media-session.service';
import { AudioService } from './audio.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private audioService = inject(AudioService);
  private localStorageService = inject(LocalStorageService);
  private fileLoaderService = inject(FileLoaderService);
  private metadataService = inject(MetadataService);
  private themeService = inject(ThemeService);
  private wakelockService = inject(WakelockService, { optional: true });
  private mediaSessionService = inject(MediaSessionService, { optional: true });

  private destroRef = inject(DestroyRef);

  readonly currentPlaylist = signal<Track[]>([]);

  readonly selectedTrack = signal<Track | undefined>(undefined);

  readonly currentlyLoadedTrack = signal<Track | undefined>(undefined);

  readonly repeat = signal<RepeatMode>(this.localStorageService.retrieve('repeat') || 'off');
  readonly shuffle = signal<boolean>(this.localStorageService.retrieve('shuffle') ?? false);

  readonly colorConfig = computed<ColorConfig>(() => {
    const coverColors = this.currentlyLoadedTrack()?.metadata?.coverColors;
    const mainColor = coverColors?.darkVibrant?.hex;
    const peakColor = coverColors?.lightVibrant?.hex;
    return { mainColor: mainColor, peakColor: peakColor };
  });

  constructor() {
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
        // Focus the window first to ensure we're the active window
        window.focus();
        // Nothing to do when the queue is empty.
        if (launchParameters.files.length === 0) {
          return;
        }

        const validFiles: FileData[] = [];

        for (const fileHandle of launchParameters.files) {
          try {
            const file = await fileHandle.getFile();
            if (ALLOWED_MIMETYPES.includes(file.type)) {
              validFiles.push({ file, fileHandle });
            }
          } catch (error) {
            console.error('Error processing file:', error);
          }
        }

        if (validFiles.length) {
          await this.addFilesToPlaylist(...validFiles);
          // If you want to play the first file immediately
          // if (validFiles.length && this.currentPlaylist().length) {
          //   const newTrack = this.currentPlaylist()[this.currentPlaylist().length - validFiles.length];
          //   await this.playTrack(newTrack);
          // }
        }
      });
    }

    this.audioService.hasEnded$.pipe(takeUntilDestroyed(this.destroRef)).subscribe(() => {
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
    const fileDatas: FileData[] = await this.fileLoaderService.openFiles();
    return this.addFilesToPlaylist(...fileDatas);
  }

  addTrackToPlaylist(song: Track) {
    if (!this.currentPlaylist().some((playlistSong) => playlistSong.metadata?.crc === song.metadata?.crc)) {
      this.currentPlaylist.update((playlist) => [...playlist, song]);
    }
  }

  async addFilesToPlaylist(...fileDatas: FileData[]) {
    for await (const track of this.metadataService.addFilesToLibrary(...fileDatas)) {
      this.addTrackToPlaylist(track);
    }
  }

  setSeekPosition(value: number | undefined, fastSeek = false) {
    if (value !== undefined && value >= 0 && value <= this.durationSeconds()) {
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
    return Math.floor(pos);
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
    const loadedTrack = this.currentlyLoadedTrack();
    if (this.audioService.isLoading() || !loadedTrack) {
      return;
    }

    const playlist = this.currentPlaylist();

    if (this.shuffle()) {
      const randomPosition = getRandomInt(0, playlist.length - 1);
      return this.playTrack(playlist[randomPosition]);
    }

    const currentPosition = playlist.indexOf(loadedTrack);
    if (currentPosition < playlist.length - 1) {
      return this.playTrack(playlist[currentPosition + 1]);
    } else if (this.repeat() === 'all') {
      return this.playTrack(playlist[0]);
    }
  }

  async previous() {
    if (this.audioService.isLoading() || !this.currentlyLoadedTrack()) {
      return;
    }

    const loadedTrack = this.currentlyLoadedTrack();

    if (!loadedTrack) {
      return this.playTrack(this.currentPlaylist()[0]);
    }

    const currentPosition = this.currentPlaylist().indexOf(loadedTrack);

    if (currentPosition > 0) {
      return this.playTrack(this.currentPlaylist()[currentPosition - 1]);
    }
  }

  async playTrackByCrc(crc: string) {
    const playlist = this.currentPlaylist();

    const track = playlist.find((playlistTrack) => playlistTrack.metadata?.crc === crc);
    if (track) {
      await this.playTrack(track);
    }
  }

  async selectNext() {
    if (!this.selectedTrack()) {
      return;
    }

    const selectedTrack = this.selectedTrack();

    if (!selectedTrack) {
      return this.playTrack(this.currentPlaylist()[0]);
    }

    const currentPosition = this.currentPlaylist().indexOf(selectedTrack);

    if (currentPosition < this.currentPlaylist.length) {
      this.selectedTrack.set(this.currentPlaylist()[currentPosition]);
    }
  }

  async selectPrevious() {
    if (!this.selectedTrack()) {
      return;
    }
    const selectedTrack = this.selectedTrack();

    if (!selectedTrack) {
      return this.playTrack(this.currentPlaylist()[0]);
    }

    const currentPosition = this.currentPlaylist().indexOf(selectedTrack);

    if (currentPosition > 1) {
      this.selectedTrack.set(this.currentPlaylist()[currentPosition - 2]);
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
  // eslint-disable-next-line sonarjs/pseudo-random
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
