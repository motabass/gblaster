import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  constructor() {}

  @Input()
  analyser: AnalyserNode;

  @Input()
  currentSong: Song;

  @Input()
  songs: Song[] = [];

  @Output()
  playSong: EventEmitter<Song> = new EventEmitter<Song>();

  @Output()
  pauseSong: EventEmitter<Song> = new EventEmitter<Song>();

  ngOnInit(): void {}

  isPlaying(song: Song): boolean {
    return song.howl.playing();
  }
}
