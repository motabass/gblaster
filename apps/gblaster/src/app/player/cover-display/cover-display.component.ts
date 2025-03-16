import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ThemeService } from '../../theme/theme.service';
import { TimePipe } from '../time.pipe';
import { Track } from '../player.types';
import { BitratePipe } from './bitrate.pipe';

@Component({
  selector: 'mtb-cover-display',
  templateUrl: './cover-display.component.html',
  styleUrl: './cover-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimePipe, BitratePipe]
})
export class CoverDisplayComponent {
  private themeService = inject(ThemeService);

  readonly track = input.required<Track | undefined>();

  readonly coverUrl = computed(() => this.track()?.metadata?.coverUrl?.original);

  readonly backgroundColor = computed(() => {
    const coverBackground = this.themeService.darkMode()
      ? this.track()?.metadata?.coverColors?.darkMuted?.hex
      : this.track()?.metadata?.coverColors?.lightMuted?.hex;
    return coverBackground || 'rgba(0,0,0,0)';
  });
}
