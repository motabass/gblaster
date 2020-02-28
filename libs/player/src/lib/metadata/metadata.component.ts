import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ThemeService } from '@motabass/core/theme';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataComponent {
  @Input()
  song?: Song;

  constructor(private themeService: ThemeService) {}

  get coverUrl(): string | undefined {
    if (this.song?.metadata.coverUrl) {
      return this.song.metadata.coverUrl;
    }
  }

  get backgroundColor(): string {
    const color = this.song?.metadata?.coverColors?.Vibrant ? this.song.metadata.coverColors.Vibrant.getHex() : 'rgba(0,0,0,0)';
    this.themeService.setPrimaryColor(color);
    return color;
  }

  get fontColor(): string | null {
    return this.song?.metadata?.coverColors?.Vibrant ? this.song.metadata.coverColors.Vibrant.getTitleTextColor() : null;
  }
}
