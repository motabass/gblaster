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
    return this.isActive(song) && !this.playerService.audioElement.paused;
  }

  isActive(song: Song) {
    return this.currentSong === song;
  }

  get currentSong(): Song {
    return this.playerService.currentSong;
  }

  get analyser(): AnalyserNode {
    return this.playerService.analyser;
  }

  playPauseSong(event: Event, song: Song) {
    event.stopPropagation();
    this.playerService.playPauseSong(song);
  }
}
