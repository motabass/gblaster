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
    this.selectSong(songs[0]);
    this.playerService.playingSong = songs[0];
  }

  _songs: Song[] = [];

  ngOnInit(): void {}

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
}
