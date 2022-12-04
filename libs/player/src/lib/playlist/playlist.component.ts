import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VisualizerMode, VisualsColorConfig, VisualsService } from '@motabass/ui-components/visuals';
import { PlayerService } from '../player.service';
import { Song } from '../player.types';
import { LoaderService } from '@motabass/helper-services/loader';
import { Observable } from 'rxjs';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent {
  constructor(private playerService: PlayerService, private visualsService: VisualsService, private loaderService: LoaderService) {}

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

    if (!this.selectedSong && this.playerService.currentPlaylist.length) {
      this.selectSong(this.playerService.currentPlaylist[0]);
    }
    return this.playerService.currentPlaylist;
  }

  isPlaying(song: Song): boolean {
    if (song !== this.playingSong) {
      return false;
    }
    return !this.playerService.audioElement.paused;
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
    return this.playerService.analyser;
  }

  playlistTrackFunction(index: number, song: Song) {
    return song.metadata?.crc;
  }

  get colorConfig(): VisualsColorConfig {
    return { mainColor: this.mainColor, peakColor: this.peakColor };
  }

  get mainColor(): string {
    const color = this.playerService.selectedSong?.metadata?.coverColors?.darkVibrant?.hex;
    return color ? color : 'red';
  }

  get peakColor(): string {
    const color = this.playerService.selectedSong?.metadata?.coverColors?.lightVibrant?.hex;
    return color ? color : 'yellow';
  }

  drop(event: CdkDragDrop<Song>) {
    moveItemInArray(this.songs, event.previousIndex, event.currentIndex);
  }
}
