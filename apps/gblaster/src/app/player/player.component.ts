import { Component, computed, inject, OnInit } from '@angular/core';
import { TitleService } from '../services/title.service';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { PlayerService } from './player.service';
import { VisualizerComponent } from './visualizer/visualizer.component';

@Component({
  imports: [PlaylistComponent, CoverDisplayComponent, VisualizerComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export default class PlayerComponent implements OnInit {
  readonly #titleService = inject(TitleService);
  readonly #playerService = inject(PlayerService);
  protected readonly trackMetadata = computed(() => this.#playerService.currentlyLoadedTrack()?.metadata ?? null);

  ngOnInit() {
    this.#titleService.setTitle('gBlaster');
  }
}
