import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { TitleService } from '../services/title.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlaylistComponent } from './playlist/playlist.component';

@Component({
  imports: [
    PlaylistComponent,
    MatButtonModule,
    MatIconModule,
    CoverDisplayComponent,
    MatToolbarModule,
    MatTooltipModule,
    MatSliderModule,
    MatMenuModule
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlayerComponent {
  private readonly titleService = inject(TitleService);

  constructor() {
    this.titleService.setTitle('gBlaster');
  }
}
