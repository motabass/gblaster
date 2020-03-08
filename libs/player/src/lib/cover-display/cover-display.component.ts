import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-cover-display',
  templateUrl: './cover-display.component.html',
  styleUrls: ['./cover-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverDisplayComponent {
  @Input()
  song?: Song;

  constructor() {}

  get coverUrl(): string | undefined {
    if (this.song?.metadata?.coverUrl) {
      return this.song.metadata.coverUrl;
    }
  }

  get backgroundColor(): string | undefined {
    return this.song?.metadata?.coverColors?.vibrant ? this.song.metadata.coverColors.vibrant.hex : 'rgba(0,0,0,0)';
  }

  // get fontColor(): string | undefined {
  //   return this.song?.metadata?.coverColors?.vibrant ? this.song.metadata.coverColors.vibrant.textHex : undefined;
  // }
}
