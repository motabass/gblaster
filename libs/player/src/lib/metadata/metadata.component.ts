import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataComponent {
  @Input()
  song: Song;
  constructor() {}

  get coverUrl(): SafeStyle {
    return this.song.metadata.coverUrl;
  }
}
