import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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

  constructor() {}

  get coverUrl(): string | undefined {
    if (this.song?.metadata.coverUrl) {
      return this.song.metadata.coverUrl;
    }
  }
}
