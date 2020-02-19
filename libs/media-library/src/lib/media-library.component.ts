import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../../ui-components/player/src/lib/player.service';
import { Song } from '../../../ui-components/player/src/lib/player.types';

@Component({
  selector: 'motabass-media-library',
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.css']
})
export class MediaLibraryComponent implements OnInit {
  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {}

  get analyser(): AnalyserNode {
    return this.playerService.analyser;
  }

  get currentSong(): Song {
    return this.playerService.currentSong;
  }
}
