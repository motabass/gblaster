import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Track } from '../player.types';
import { ThemeService } from '../../theme/theme.service';
import { TimePipe } from '../time.pipe';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'mtb-cover-display',
  templateUrl: './cover-display.component.html',
  styleUrls: ['./cover-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgStyle, TimePipe]
})
export class CoverDisplayComponent {
  @Input() track?: Track | null;

  constructor(private themeService: ThemeService) {}

  get coverUrl(): string | undefined {
    if (this.track?.metadata?.coverUrl) {
      return this.track.metadata.coverUrl.original;
    }
  }

  get backgroundColor(): string | undefined {
    const coverBackground = this.themeService.darkMode ? this.track?.metadata?.coverColors?.darkMuted?.hex : this.track?.metadata?.coverColors?.lightMuted?.hex;
    return coverBackground || 'rgba(0,0,0,0)';
  }

  // get fontColor(): string | undefined {
  //   return this.song?.metadata?.coverColors?.vibrant ? this.song.metadata.coverColors.vibrant.textHex : undefined;
  // }

  getBitrate(bitrate: number): string {
    return Math.round(bitrate / 1000).toString();
  }
}
