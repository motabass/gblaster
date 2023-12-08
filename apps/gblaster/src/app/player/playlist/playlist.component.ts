import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragPreview, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { PlayerService } from '../player.service';
import { Track } from '../player.types';
import { filter, Observable } from 'rxjs';
import { VisualsService } from '../visualizer/visuals/visuals.service';
import { VisualizerMode, VisualsColorConfig } from '../visualizer/visuals/visuals.types';
import { LoaderService } from '../../services/loader/loader.service';
import { AudioService } from '../audio.service';
import { map } from 'rxjs/operators';
import { SafePipeModule } from 'safe-pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VisualsDirective } from '../visualizer/visuals/visuals.directive';
import { NgFor, NgClass, NgIf, AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MobxAngularModule } from 'mobx-angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  standalone: true,
  imports: [
    MobxAngularModule,
    MatListModule,
    CdkDropList,
    NgFor,
    CdkDrag,
    NgClass,
    CdkDragPreview,
    CdkDragHandle,
    NgIf,
    VisualsDirective,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
    SafePipeModule,
    MatProgressSpinnerModule
  ]
})
export class PlaylistComponent implements OnDestroy {
  analyser: AnalyserNode;
  constructor(
    private playerService: PlayerService,
    private audioService: AudioService,
    private visualsService: VisualsService,
    private loaderService: LoaderService
  ) {
    this.analyser = this.audioService.plugAnalyser();
  }

  ngOnDestroy(): void {
    this.analyser.disconnect();
  }

  get isLoading(): Observable<boolean> {
    return this.loaderService.isLoading;
  }

  get visualMode(): VisualizerMode {
    return this.visualsService.visualMode;
  }

  get songs(): Track[] {
    for (const [i, v] of this.playerService.currentPlaylist.entries()) {
      v.playlistPosition = i + 1;
    }

    if (!this.selectedSong && this.playerService.currentPlaylist.length > 0) {
      this.selectSong(this.playerService.currentPlaylist[0]);
    }
    return this.playerService.currentPlaylist;
  }

  isActive$(song: Track): Observable<boolean> {
    return this.playerService.playState$.pipe(
      filter((state) => state.state === 'playing' || state.state === 'paused'),
      map((state) => state.currentTrack === song)
    );
  }

  isPlaying$(song: Track): Observable<boolean> {
    return this.playerService.playState$.pipe(
      filter((state) => state.state === 'playing' && !!state.currentTrack),
      map((state) => state.currentTrack === song && this.playerService.playing)
    );
  }

  get playingTrack$(): Observable<Track | undefined> {
    return this.playerService.playState$.pipe(
      filter((state) => state.state === 'playing' && !!state.currentTrack),
      map((state) => state.currentTrack)
    );
  }

  get selectedSong(): Track | undefined {
    return this.playerService.selectedTrack;
  }

  isSelected(song: Track) {
    return this.selectedSong === song;
  }

  selectSong(song: Track) {
    this.playerService.selectSong(song);
  }

  async playPauseSong(event: Event, song: Track): Promise<void> {
    event.stopPropagation();
    return this.playerService.playPauseTrack(song);
  }

  get colorConfig$(): Observable<VisualsColorConfig> {
    return this.playingTrack$.pipe(
      map((track) => ({ mainColor: track?.metadata?.coverColors?.darkVibrant?.hex, peakColor: track?.metadata?.coverColors?.lightVibrant?.hex }))
    );
  }

  drop(event: CdkDragDrop<Track>) {
    moveItemInArray(this.songs, event.previousIndex, event.currentIndex);
  }
}
