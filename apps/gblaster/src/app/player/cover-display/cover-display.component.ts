import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { ThemeService } from '../../theme/theme.service';
import { TimePipe } from '../time.pipe';
import { NgStyle } from '@angular/common';
import { Track } from '../player.types';

@Component({
  selector: 'mtb-cover-display',
  templateUrl: './cover-display.component.html',
  styleUrl: './cover-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle, TimePipe]
})
export class CoverDisplayComponent {
  private themeService = inject(ThemeService);

  readonly track = input<Track>();

  readonly coverUrl = computed(() => this.track()?.metadata?.coverUrl?.original);

  readonly backgroundColor = computed(() => {
    const coverBackground = this.themeService.darkMode()
      ? this.track()?.metadata?.coverColors?.darkMuted?.hex
      : this.track()?.metadata?.coverColors?.lightMuted?.hex;
    return coverBackground || 'rgba(0,0,0,0)';
  });

  // get fontColor(): string | undefined {
  //   return this.song?.metadata?.coverColors?.vibrant ? this.song.metadata.coverColors.vibrant.textHex : undefined;
  // }

  // TODO: pipe
  getBitrate(bitrate: number | undefined): string {
    if (!bitrate) {
      return '0';
    }
    return Math.round(bitrate / 1000).toString();
  }
}
