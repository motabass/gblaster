import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TitleService } from '../services/title.service';

import { CoverDisplayComponent } from './cover-display/cover-display.component';

import { PlaylistComponent } from './playlist/playlist.component';

@Component({
  imports: [PlaylistComponent, CoverDisplayComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlayerComponent implements OnInit {
  private readonly titleService = inject(TitleService);

  ngOnInit() {
    this.titleService.setTitle('gBlaster');
  }
}
