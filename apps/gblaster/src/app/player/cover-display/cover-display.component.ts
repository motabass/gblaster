import { BitratePipe } from './bitrate.pipe';
import { VisualizerComponent } from '../visualizer/visualizer.component';
import { PlayerService } from '../player.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../theme/theme.service';
import { TimePipe } from '../time.pipe';

@Component({
  selector: 'mtb-cover-display',
  imports: [TimePipe, BitratePipe, VisualizerComponent],
  templateUrl: './cover-display.component.html',
  styleUrl: './cover-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverDisplayComponent {
  private readonly themeService = inject(ThemeService);
  protected readonly playerService = inject(PlayerService);

  protected readonly coverUrl = computed(
    () => this.playerService.currentlyLoadedTrack()?.metadata?.coverUrl?.originalUrl
  );

  protected readonly backgroundColor = computed(() => {
    const coverBackground = this.themeService.darkMode()
      ? this.playerService.currentlyLoadedTrack()?.metadata?.coverColors?.darkMuted?.hex
      : this.playerService.currentlyLoadedTrack()?.metadata?.coverColors?.lightMuted?.hex;
    return coverBackground || 'rgba(0,0,0,0)';
  });
}
