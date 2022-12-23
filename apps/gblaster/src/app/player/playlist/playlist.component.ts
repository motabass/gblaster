import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlayerService } from '../player.service';
import { Track } from '../player.types';
import { filter, Observable } from 'rxjs';
import { VisualsService } from '../visualizer/visuals/visuals.service';
import { VisualizerMode, VisualsColorConfig } from '../visualizer/visuals/visuals.types';
import { LoaderService } from '../../services/loader/loader.service';
import { AudioService } from '../audio.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent {
  constructor(
    private playerService: PlayerService,
    private audioService: AudioService,
    private visualsService: VisualsService,
    private loaderService: LoaderService
  ) {}

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

  get analyser(): AnalyserNode {
    return this.audioService.analyser;
  }

  playlistTrackFunction(index: number, song: Track) {
    return song.metadata?.crc;
  }

  get colorConfig$(): Observable<VisualsColorConfig> {
    return this.playingTrack$.pipe(
      map((track) => {
        return { mainColor: track?.metadata?.coverColors?.darkVibrant?.hex, peakColor: track?.metadata?.coverColors?.lightVibrant?.hex };
      })
    );
  }

  drop(event: CdkDragDrop<Track>) {
    moveItemInArray(this.songs, event.previousIndex, event.currentIndex);
  }
}
