import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { VisualizerMode, VisualsService } from '@motabass/ui-components/visuals';
import { PlayerService } from '../player.service';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent {
  constructor(private playerService: PlayerService, private visualsService: VisualsService, private domSanitizer: DomSanitizer) {}

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

  sanitizeCoverUrl(url: string): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  playlistTrackFunction(index: number, song: Song) {
    return song.metadata?.crc;
  }
}
