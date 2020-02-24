import { Component, Input, OnInit } from '@angular/core';
import { PlayerService } from '../player.service';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  constructor(private playerService: PlayerService) {}

  @Input()
  set songs(songs: Song[]) {
    for (const [i, v] of songs.entries()) {
      v.playlistPosition = i + 1;
    }

    this._songs = songs;
  }

  _songs: Song[] = [];

  ngOnInit(): void {}

  isPlaying(song: Song): boolean {
    if (song !== this.playingSong) {
      return false;
    }
    return !this.playerService.audioElement.paused;
  }

  isSelected(song: Song) {
    return this.selectedSong === song;
  }

  isCurrent(song: Song) {
    return this.playingSong === song;
  }

  get playingSong(): Song | undefined {
    return this.playerService.playingSong;
  }

  get analyser(): AnalyserNode {
    return this.playerService.analyser;
  }

  get selectedSong(): Song | undefined {
    return this.playerService.selectedSong;
  }

  selectSong(song: Song) {
    this.playerService.selectedSong = song;
  }

  async playPauseSong(event: Event, song: Song): Promise<void> {
    event.stopPropagation();
    return this.playerService.playPauseSong(song);
  }
}
