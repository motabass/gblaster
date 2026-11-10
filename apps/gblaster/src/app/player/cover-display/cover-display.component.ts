import { BitratePipe } from './bitrate.pipe';
import { Component, computed, inject, input } from '@angular/core';
import { ThemeService } from '../../theme/theme.service';
import { TimePipe } from '../time.pipe';
import { TrackMetadata } from '../player.types';

/**
Displays track artwork, metadata, and a theme-aware cover background.
*/
@Component({
  selector: 'mtb-cover-display',
  imports: [TimePipe, BitratePipe],
  templateUrl: './cover-display.component.html',
  styleUrl: './cover-display.component.scss'
})
export class CoverDisplayComponent {
  readonly #themeService = inject(ThemeService);
  readonly trackMetadata = input<TrackMetadata | null>(null);

  protected readonly coverUrl = computed(() => this.trackMetadata()?.coverUrl?.originalUrl);

  protected readonly backgroundColor = computed(() => {
    const coverBackground = this.#themeService.darkMode()
      ? this.trackMetadata()?.coverColors?.darkMuted?.hex
      : this.trackMetadata()?.coverColors?.lightMuted?.hex;
    return coverBackground || 'rgba(0,0,0,0)';
  });
}
