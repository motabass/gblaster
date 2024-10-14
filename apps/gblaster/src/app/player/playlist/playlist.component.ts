import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, OnDestroy, Signal, inject } from '@angular/core';
import { PlayerService } from '../player.service';
import { Track } from '../player.types';
import { VisualsService } from '../visualizer/visuals/visuals.service';
import { VisualsColorConfig } from '../visualizer/visuals/visuals.types';
import { LoaderService } from '../../services/loader/loader.service';
import { AudioService } from '../audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VisualsDirective } from '../visualizer/visuals/visuals.directive';
import { NgClass } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SafePipe } from 'safe-pipe';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  standalone: true,
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
    SafePipe
  ]
})
export class PlaylistComponent implements OnDestroy {
  playerService = inject(PlayerService);
  private audioService = inject(AudioService);
  visualsService = inject(VisualsService);
  loaderService = inject(LoaderService);

  analyser: AnalyserNode;
  constructor() {
    this.analyser = this.audioService.plugAnalyser();
  }

  ngOnDestroy(): void {
    this.analyser.disconnect();
  }

  songs = computed(() => {
    for (const [i, v] of this.playerService.currentPlaylist().entries()) {
      v.playlistPosition = i + 1;
    }

    return this.playerService.currentPlaylist().map((track, index) => ({ ...track, playlistPosition: index + 1 }));
  });

  colorConfig = computed(() => {
    const track = this.playerService.playingTrack();
    if (track) {
      return { mainColor: track?.metadata?.coverColors?.darkVibrant?.hex, peakColor: track?.metadata?.coverColors?.lightVibrant?.hex } as VisualsColorConfig;
    }
    return { mainColor: undefined, peakColor: undefined } as VisualsColorConfig;
  });

  isActive(song: Track): Signal<boolean> {
    return computed(() => {
      const state = this.playerService.playState();
      return (state.state === 'playing' || state.state === 'paused') && state.currentTrack?.metadata?.crc === song.metadata?.crc;
    });
  }

  isPlaying(song: Track): Signal<boolean> {
    return computed(() => {
      const state = this.playerService.playState();
      return state.state === 'playing' && state.currentTrack?.metadata?.crc === song.metadata?.crc && this.playerService.playing();
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
