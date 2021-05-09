import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-cover-display',
  templateUrl: './cover-display.component.html',
  styleUrls: ['./cover-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverDisplayComponent {
  @Input() song?: Song;

  constructor() {}

  get coverUrl(): string | undefined {
    if (this.song?.metadata?.coverUrl) {
      return this.song.metadata.coverUrl.original;
    }
  }

  get backgroundColor(): string | undefined {
    return this.song?.metadata?.coverColors?.vibrant ? this.song.metadata.coverColors.vibrant.hex : 'rgba(0,0,0,0)';
  }

  // get fontColor(): string | undefined {
  //   return this.song?.metadata?.coverColors?.vibrant ? this.song.metadata.coverColors.vibrant.textHex : undefined;
  // }

  getBitrate(bitrate: number): string {
    return Math.round(bitrate / 1000).toString();
  }
}
