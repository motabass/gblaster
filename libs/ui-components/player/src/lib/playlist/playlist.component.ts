import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PlayerService } from '../player.service';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  constructor(private playerService: PlayerService, private domSanitizer: DomSanitizer) {}

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
    return song.howl.playing();
  }

  isActive(song: Song) {
    return this.playerService.currentSong === song;
  }

  get currentSong(): Song {
    return this.playerService.currentSong;
  }

  get analyser(): AnalyserNode {
    return this.playerService.analyser;
  }

  playSong(event: Event, song: Song) {
    event.stopPropagation();
    this.playerService.playSong(song);
  }

  pauseSong(event: Event) {
    event.stopPropagation();
    this.playerService.playPause();
  }
}
