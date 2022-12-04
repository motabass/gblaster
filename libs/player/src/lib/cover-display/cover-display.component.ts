import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song } from '../player.types';
import { ThemeService } from '@motabass/core/theme';

@Component({
  selector: 'mtb-cover-display',
  templateUrl: './cover-display.component.html',
  styleUrls: ['./cover-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverDisplayComponent {
  @Input() song?: Song;

  constructor(private themeService: ThemeService) {}

  get coverUrl(): string | undefined {
    if (this.song?.metadata?.coverUrl) {
      return this.song.metadata.coverUrl.original;
    }
  }

  get backgroundColor(): string | undefined {
    const coverBackground = this.themeService.darkMode ? this.song?.metadata?.coverColors?.darkMuted?.hex : this.song?.metadata?.coverColors?.lightMuted?.hex;
    return coverBackground || 'rgba(0,0,0,0)';
  }

  // get fontColor(): string | undefined {
  //   return this.song?.metadata?.coverColors?.vibrant ? this.song.metadata.coverColors.vibrant.textHex : undefined;
  // }

  getBitrate(bitrate: number): string {
    return Math.round(bitrate / 1000).toString();
  }
}
