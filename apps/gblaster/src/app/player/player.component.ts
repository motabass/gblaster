import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { PlayerService } from './player.service';
import { TitleService } from '../services/title.service';
import { AudioService } from './audio.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlaylistComponent } from './playlist/playlist.component';

@Component({
  selector: 'mtb-player',
  imports: [PlaylistComponent, MatButtonModule, MatIconModule, CoverDisplayComponent, MatToolbarModule, MatTooltipModule, MatSliderModule, MatMenuModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlayerComponent implements OnInit {
  private titleService = inject(TitleService);
  private fileLoaderService = inject(FileLoaderService);
  playerService = inject(PlayerService);
  audioService = inject(AudioService);

  ngOnInit() {
    this.titleService.setTitle('gBlaster');
  }
}
