import { Component, computed, input } from '@angular/core';
import { BitratePipe } from '../cover-display/bitrate.pipe';
import { TimePipe } from '../time.pipe';
import { TrackMetadata } from '../player.types';

/**
Displays metadata details for a selected library track.
*/
@Component({
  selector: 'library-track-details',
  imports: [TimePipe, BitratePipe],
  templateUrl: './library-track-details.component.html',
  styleUrl: './library-track-details.component.scss'
})
export class LibraryTrackDetailsComponent {
  readonly trackMetadata = input<TrackMetadata | null>(null);

  protected readonly coverUrl = computed(() => this.trackMetadata()?.coverUrl?.originalUrl);
}
