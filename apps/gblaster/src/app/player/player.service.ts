import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FileLoaderService } from './file-loader-service/file-loader.service';
import { MetadataService } from './metadata-service/metadata.service';
import type { ColorConfig, RepeatMode, Track } from './player.types';
import { ALLOWED_MIMETYPES, FileData } from './file-loader-service/file-loader.helpers';
import { ThemeService } from '../theme/theme.service';
import { WakelockService } from '../services/wakelock.service';
import { MediaSessionService } from '../services/media-session/media-session.service';
import { AudioService } from './audio.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getRandomInt } from './player-helper';
import { extractColorsWithNodeVibrant } from './metadata-service/metadata-helper';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly audioService = inject(AudioService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly fileLoaderService = inject(FileLoaderService);
  private readonly metadataService = inject(MetadataService);
  private readonly themeService = inject(ThemeService);
  private readonly wakelockService = inject(WakelockService, {
    optional: true
  });
  private readonly mediaSessionService = inject(MediaSessionService, {
    optional: true
  });
  private readonly destroRef = inject(DestroyRef);

  private readonly _currentPlaylist = signal<Track[]>([]);
  readonly currentPlaylist = this._currentPlaylist.asReadonly();

  private readonly _selectedTrack = signal<Track | undefined>(undefined);
  readonly selectedTrack = this._selectedTrack.asReadonly();

  private readonly _currentlyLoadedTrack = signal<Track | undefined>(undefined);
  readonly currentlyLoadedTrack = this._currentlyLoadedTrack.asReadonly();

  private readonly _repeat = signal<RepeatMode>(this.localStorageService.retrieve('repeat') || 'off');
  readonly repeat = this._repeat.asReadonly();
  private readonly _shuffle = signal<boolean>(this.localStorageService.retrieve('shuffle') ?? false);
  readonly shuffle = this._shuffle.asReadonly();

  readonly colorConfig = computed<ColorConfig>(() => {
    const coverColors = this.currentlyLoadedTrack()?.metadata?.coverColors;
    const mainColor = coverColors?.darkVibrant?.hex;
    const peakColor = coverColors?.lightVibrant?.hex;
    return { mainColor: mainColor, peakColor: peakColor };
  });

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
      launchQueue.setConsumer(async (launchParameters) => {
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

        if (validFiles.length > 0) {
          for await (const track of this.metadataService.addFilesToLibrary(validFiles)) {
            this.addTrackToPlaylist(track);
          }
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
        artwork: track.metadata.coverUrl?.originalUrl
          ? [{ src: track.metadata.coverUrl.originalUrl, sizes: '512x512' }]
          : undefined
      });
    }

    // Extract colors lazily when the track is played
    if (!track.metadata.coverColors) {
      void this.extractAndSetCoverColors(track);
    }

    await this.audioService.play();
    this._currentlyLoadedTrack.set(track);
    await this.afterPlayLoaded();
  }

  private async extractAndSetCoverColors(track: Track) {
    try {
      const augmentedMeta = this.metadataService.applyEmbeddedCoverObjectUrsl(track.metadata);
      const coverUrl = augmentedMeta.coverUrl?.originalUrl;

      if (coverUrl && coverUrl !== 'assets/icons/record.svg') {
        const palette = await extractColorsWithNodeVibrant(coverUrl);
        if (palette) {
          track.metadata.coverColors = palette;
          // Trigger reactivity by updating the signal
          if (this.currentlyLoadedTrack() === track) {
            this._currentlyLoadedTrack.set({ ...track });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to extract cover colors:', error);
    }
  }

  async loadFilesToLibrary(): Promise<void> {
    const files: FileData[] = await this.fileLoaderService.getFilesFromPickedFolder();
    for await (const track of this.metadataService.addFilesToLibrary(files)) {
      this.addTrackToPlaylist(track);
    }
  }

  addTrackToPlaylist(song: Track) {
    if (!this.currentPlaylist().some((playlistSong) => playlistSong.metadata?.hash === song.metadata?.hash)) {
      this._currentPlaylist.update((playlist) => [...playlist, song]);
    }
  }

  removeTrackFromPlaylist(track: Track) {
    // If the removed track is currently loaded, stop playback
    if (this.currentlyLoadedTrack() === track) {
      void this.stop();
    }

    // If the removed track is currently selected, deselect it
    if (this.selectedTrack() === track) {
      this._selectedTrack.set(undefined);
    }
    // Update the playlist by filtering out the specified track
    this._currentPlaylist.update((playlist) => playlist.filter((t) => t !== track));
  }

  setSeekPosition(value: number | undefined, fastSeek = false) {
    if (value !== undefined && value >= 0 && value <= this.durationSeconds()) {
      this.audioService.seekToPosition(value, fastSeek);
    }
  }

  selectSong(song: Track) {
    this._selectedTrack.set(song);
  }

  async playPauseTrack(track: Track) {
    if (this.audioService.isLoading()) {
      return;
    }

    if (this.currentlyLoadedTrack()?.metadata?.hash === track.metadata?.hash) {
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
    this._currentlyLoadedTrack.set(undefined);
    await this.afterPausedOrStopped();
  }

  async next(): Promise<void> {
    const loadedTrack = this.currentlyLoadedTrack();
    if (!loadedTrack || this.audioService.isLoading()) {
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
    }
    if (this.repeat() === 'all') {
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

  async playTrackByHash(hash: string) {
    const playlist = this.currentPlaylist();

    const track = playlist.find((playlistTrack) => playlistTrack.metadata?.hash === hash);
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

    if (currentPosition < this.currentPlaylist().length) {
      this._selectedTrack.set(this.currentPlaylist()[currentPosition]);
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
      this._selectedTrack.set(this.currentPlaylist()[currentPosition - 2]);
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
        this._repeat.set('all');
        break;
      }
      case 'all': {
        this.audioService.setLoop(true);
        this._repeat.set('one');
        break;
      }
      case 'one': {
        this.audioService.setLoop(false);
        this._repeat.set('off');
        break;
      }
    }
  }

  toggleShuffle() {
    this._shuffle.set(!this.shuffle());
  }
}
