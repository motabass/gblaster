import { Component, DoCheck, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PlayerService } from '../player.service';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements DoCheck {
  @Input()
  set songs(songs: Song[]) {
    this._songs = songs;
  }
  _songs: Song[] = [];

  constructor(private playerService: PlayerService, private domSanitizer: DomSanitizer) {}

  ngDoCheck(): void {
    for (const [i, v] of this._songs.entries()) {
      v.playlistPosition = i + 1;
    }

    if (!this.selectedSong) {
      this.selectSong(this._songs[0]);
      this.playerService.playingSong = this._songs[0];
    }
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
    this.playerService.selectedSong = song;
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
}
