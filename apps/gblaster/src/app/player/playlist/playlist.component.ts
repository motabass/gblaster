import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlayerService } from '../player.service';
import { Song } from '../player.types';
import { Observable } from 'rxjs';
import { VisualsService } from '../visualizer/visuals/visuals.service';
import { VisualizerMode, VisualsColorConfig } from '../visualizer/visuals/visuals.types';
import { LoaderService } from '../../services/loader/loader.service';
import { AudioService } from '../audio.service';

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

  get songs(): Song[] {
    for (const [i, v] of this.playerService.currentPlaylist.entries()) {
      v.playlistPosition = i + 1;
    }

    if (!this.selectedSong && this.playerService.currentPlaylist.length > 0) {
      this.selectSong(this.playerService.currentPlaylist[0]);
    }
    return this.playerService.currentPlaylist;
  }

  isPlaying(song: Song): boolean {
    if (song !== this.playingSong) {
      return false;
    }
    return this.playerService.playing;
  }

  get playingSong(): Song | undefined {
    return this.playerService.playingSong;
  }

  isPlayingSong(song: Song) {
    return this.playingSong === song;
  }

  get selectedSong(): Song | undefined {
    return this.playerService.selectedSong;
  }

  isSelected(song: Song) {
    return this.selectedSong === song;
  }

  selectSong(song: Song) {
    this.playerService.selectSong(song);
  }

  async playPauseSong(event: Event, song: Song): Promise<void> {
    event.stopPropagation();
    return this.playerService.playPauseSong(song);
  }

  get analyser(): AnalyserNode {
    return this.audioService.analyser;
  }

  playlistTrackFunction(index: number, song: Song) {
    return song.metadata?.crc;
  }

  get colorConfig(): VisualsColorConfig {
    return { mainColor: this.mainColor, peakColor: this.peakColor };
  }

  get mainColor(): string | undefined {
    return this.playingSong?.metadata?.coverColors?.darkVibrant?.hex;
  }

  get peakColor(): string | undefined {
    return this.playingSong?.metadata?.coverColors?.lightVibrant?.hex;
  }

  drop(event: CdkDragDrop<Song>) {
    moveItemInArray(this.songs, event.previousIndex, event.currentIndex);
  }
}
