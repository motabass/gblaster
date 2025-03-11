import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal, Signal, viewChild } from '@angular/core';
import { PlayerService } from '../player.service';
import { Track } from '../player.types';
import { VisualsService } from '../visualizer/visuals/visuals.service';
import { AudioService } from '../audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VisualsDirective } from '../visualizer/visuals/visuals.directive';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SafePipe } from 'safe-pipe';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    NgClass,
    VisualsDirective,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SafePipe,
    NgOptimizedImage,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll
  ]
})
export class PlaylistComponent {
  playerService = inject(PlayerService);
  audioService = inject(AudioService);
  visualsService = inject(VisualsService);
  private destroRef = inject(DestroyRef);

  readonly scrollViewport = viewChild<CdkVirtualScrollViewport>('scrollViewport');

  private readonly isAutoScrollEnabled = signal(false);

  constructor() {
    effect(() => {
      const playlist = this.playerService.currentPlaylist();

      // Wait for change detection to complete
      setTimeout(() => {
        if (playlist && playlist.length > 0 && this.isAutoScrollEnabled()) {
          this.scrollToBottom();
        }
      });
    });

    effect(() => {
      const viewport = this.scrollViewport();
      if (viewport) {
        viewport
          .elementScrolled()
          .pipe(takeUntilDestroyed(this.destroRef))
          .subscribe(() => {
            const scrollPosition = viewport.measureScrollOffset('bottom');
            const measureOffset = 30;
            // If user scrolled to bottom (or very close to it - within 10px)
            if (scrollPosition < measureOffset) {
              this.isAutoScrollEnabled.set(true);
            }
            // If user scrolled up
            else if (scrollPosition > measureOffset && this.isAutoScrollEnabled) {
              this.isAutoScrollEnabled.set(false);
            }
          });
      }
    });
  }

  scrollToBottom() {
    const viewport = this.scrollViewport();
    if (viewport) {
      const playlist = this.playerService.currentPlaylist();
      if (playlist && playlist.length > 0) {
        viewport.scrollToIndex(playlist.length - 1, 'smooth');
      }
    }
  }

  isActive(song: Track): Signal<boolean> {
    return computed(() => {
      return (this.audioService.isPlaying() || this.audioService.isPaused()) && this.playerService.currentlyLoadedTrack()?.metadata?.crc === song.metadata?.crc;
    });
  }

  isPlaying(song: Track): Signal<boolean> {
    return computed(() => {
      return this.audioService.isPlaying() && this.playerService.currentlyLoadedTrack()?.metadata?.crc === song.metadata?.crc;
    });
  }

  async playPauseSong(event: Event, song: Track): Promise<void> {
    event.stopPropagation();
    return this.playerService.playPauseTrack(song);
  }

  trackByCrc(index: number, song: Track): string {
    return song.metadata.crc;
  }
}
