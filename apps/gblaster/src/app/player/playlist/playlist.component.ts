import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal, Signal, viewChild } from '@angular/core';
import { PlayerService } from '../player.service';
import { Track } from '../player.types';
import { AudioService } from '../audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VisualsDirective } from '../visualizer/visuals/visuals.directive';
import { NgClass } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SafePipe } from 'safe-pipe';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'mtb-playlist',
  imports: [
    MatListModule,
    NgClass,
    VisualsDirective,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SafePipe,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    MatFormFieldModule,
    FormsModule,
    MatMenuModule
  ],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent {
  playerService = inject(PlayerService);
  audioService = inject(AudioService);
  private destroRef = inject(DestroyRef);

  readonly menuTrigger = viewChild<MatMenuTrigger>('menuTrigger');

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
            const measureOffset = 140;
            // If user scrolled to bottom (or very close to it)
            if (scrollPosition < measureOffset) {
              this.isAutoScrollEnabled.set(true);
            }
            // If user scrolled up
            else if (scrollPosition > measureOffset && this.isAutoScrollEnabled()) {
              this.isAutoScrollEnabled.set(false);
            }
          });
      }
    });

    // Scroll to bottom when playlist changes and autoscroll is enabled
    effect(() => {
      const playlist = this.playerService.currentPlaylist();

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

      // Only scroll when a track is playing
      if (isPlaying && currentTrack) {
        // Small delay to ensure UI has updated
        setTimeout(() => this.scrollToCurrentTrack());
      }
    });
  }

  private scrollToBottom() {
    const viewport = this.scrollViewport();
    if (viewport) {
      const playlist = this.playerService.currentPlaylist();
      if (playlist && playlist.length > 0) {
        viewport.scrollToIndex(playlist.length - 1, 'smooth');
      }
    }
  }

  private scrollToCurrentTrack(): void {
    const viewport = this.scrollViewport();
    const currentTrack = this.playerService.currentlyLoadedTrack();
    if (!viewport || !currentTrack) return;

    const playlist = this.playerService.currentPlaylist();
    const targetIndex = playlist.findIndex((track) => track.metadata?.hash === currentTrack.metadata?.hash);

    if (targetIndex !== -1) {
      // Get the visible range
      const visibleRange = viewport.getRenderedRange();

      // Only scroll if the track is outside the visible range
      if (targetIndex - 3 < visibleRange.start || targetIndex + 3 > visibleRange.end) {
        // Calculate distance to determine scroll behavior
        const currentIndex = Math.floor((visibleRange.start + visibleRange.end) / 2);
        const distance = Math.abs(targetIndex - currentIndex);

        // Use smooth scrolling for nearby items, instant for far away items
        const scrollBehavior = distance > 20 ? 'instant' : 'smooth';

        // For instant scrolling, center the item in the viewport
        const viewportHeight = viewport.getViewportSize();

        const itemSize = 72; // Height of each item in the list

        // Calculate offset to center the item in the viewport
        const offset = Math.max(0, targetIndex * itemSize - viewportHeight / 2 + itemSize / 2);

        viewport.scrollToOffset(offset, scrollBehavior);
      }
    }
  }

  isActive(song: Track): Signal<boolean> {
    return computed(() => {
      return (
        (this.audioService.isPlaying() || this.audioService.isPaused()) && this.playerService.currentlyLoadedTrack()?.metadata?.hash === song.metadata?.hash
      );
    });
  }

  isPlaying(song: Track): Signal<boolean> {
    return computed(() => {
      return this.audioService.isPlaying() && this.playerService.currentlyLoadedTrack()?.metadata?.hash === song.metadata?.hash;
    });
  }

  async playPauseSong(event: Event, song: Track): Promise<void> {
    event.stopPropagation();
    return this.playerService.playPauseTrack(song);
  }

  trackByHash(index: number, song: Track): string {
    return song.metadata.hash;
  }

  onContextMenu(event: MouseEvent, song: Track): void {
    event.preventDefault();
    const trigger = this.menuTrigger();
    if (!trigger) return;
    trigger.menuData = { song: song };

    // Open with position
    trigger.openMenu();

    // set position
    if (trigger.menu) {
      // Forcefully reset the menu position after it's opened
      setTimeout(() => {
        const overlayRef = document.querySelector('.cdk-overlay-pane:last-child') as HTMLElement;
        if (overlayRef) {
          overlayRef.style.position = 'absolute';
          overlayRef.style.left = `${event.clientX}px`;
          overlayRef.style.top = `${event.clientY}px`;
        }
      });
    }
  }
}
