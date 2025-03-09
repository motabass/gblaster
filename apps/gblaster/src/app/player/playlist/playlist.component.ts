import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { PlayerService } from '../player.service';
import { Track } from '../player.types';
import { VisualsService } from '../visualizer/visuals/visuals.service';
import { LoaderService } from '../../services/loader/loader.service';
import { AudioService } from '../audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VisualsDirective } from '../visualizer/visuals/visuals.directive';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SafePipe } from 'safe-pipe';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    CdkDropList,
    CdkDrag,
    NgClass,
    CdkDragPreview,
    CdkDragHandle,
    VisualsDirective,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SafePipe,
    NgOptimizedImage
  ]
})
export class PlaylistComponent {
  playerService = inject(PlayerService);
  audioService = inject(AudioService);
  visualsService = inject(VisualsService);
  loaderService = inject(LoaderService);

  readonly songs = computed(() => {
    for (const [index, v] of this.playerService.currentPlaylist().entries()) {
      v.playlistPosition = index + 1;
    }

    return this.playerService.currentPlaylist().map((track, index) => ({ ...track, playlistPosition: index + 1 }));
  });

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

  drop(event: CdkDragDrop<Track>) {
    moveItemInArray(this.songs(), event.previousIndex, event.currentIndex);
  }
}
