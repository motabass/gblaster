import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
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
