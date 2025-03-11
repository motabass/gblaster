import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, model, signal, Signal, viewChild } from '@angular/core';
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
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    CdkFixedSizeVirtualScroll,
    MatFormFieldModule,
    MatInput,
    FormsModule
  ]
})
export class PlaylistComponent {
  playerService = inject(PlayerService);
  audioService = inject(AudioService);
  visualsService = inject(VisualsService);
  private destroRef = inject(DestroyRef);

  readonly searchTerm = signal('');

  readonly filteredPlaylist = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.playerService.currentPlaylist();

    return (
      this.playerService
        .currentPlaylist()
        // search in title, artist and file name
        .filter((song) => (song.metadata?.title || song.file.name).toLowerCase().includes(term) || (song.metadata?.artist || '').toLowerCase().includes(term))
    );
  });

  readonly scrollViewport = viewChild<CdkVirtualScrollViewport>('scrollViewport');

  private readonly isAutoScrollEnabled = signal(false);

  constructor() {
    // Enable auto scroll when user scrolls to bottom
    effect(() => {
      const viewport = this.scrollViewport();
      if (viewport) {
        viewport
          .elementScrolled()
          .pipe(takeUntilDestroyed(this.destroRef))
          .subscribe(() => {
            const scrollPosition = viewport.measureScrollOffset('bottom');
            const measureOffset = 60;
            // If user scrolled to bottom (or very close to it)
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

    // Scroll to bottom when playlist changes and autoscroll is enabled
    effect(() => {
      const playlist = this.filteredPlaylist();

      // Wait for change detection to complete
      setTimeout(() => {
        if (playlist && playlist.length > 0 && this.isAutoScrollEnabled()) {
          this.scrollToBottom();
        }
      });
    });

    // Scroll to current track when it changes
    effect(() => {
      const isPlaying = this.audioService.isPlaying();
      const currentTrack = this.playerService.currentlyLoadedTrack();
      const searchTerm = this.searchTerm();

      // Only scroll when a track is playing
      if (isPlaying && currentTrack && !searchTerm) {
        // Small delay to ensure UI has updated
        setTimeout(() => this.scrollToCurrentTrack());
      }
    });
  }

  private scrollToBottom() {
    const viewport = this.scrollViewport();
    if (viewport) {
      const playlist = this.filteredPlaylist();
      if (playlist && playlist.length > 0) {
        viewport.scrollToIndex(playlist.length - 1, 'smooth');
      }
    }
  }

  private scrollToCurrentTrack(): void {
    const viewport = this.scrollViewport();
    const currentTrack = this.playerService.currentlyLoadedTrack();
    if (!viewport || !currentTrack) return;

    const playlist = this.filteredPlaylist();
    const targetIndex = playlist.findIndex((track) => track.metadata?.crc === currentTrack.metadata?.crc);

    if (targetIndex !== -1) {
      // Get the visible range
      const visibleRange = viewport.getRenderedRange();

      // Only scroll if the track is outside the visible range
      if (targetIndex - 3 < visibleRange.start || targetIndex + 3 > visibleRange.end) {
        // Calculate distance to determine scroll behavior
        const currentIndex = Math.floor((visibleRange.start + visibleRange.end) / 2);
        const distance = Math.abs(targetIndex - currentIndex);

        // Use smooth scrolling for nearby items, instant for far away items
        const scollBehavior = distance > 20 ? 'auto' : 'smooth';

        viewport.scrollToIndex(targetIndex, scollBehavior);
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
