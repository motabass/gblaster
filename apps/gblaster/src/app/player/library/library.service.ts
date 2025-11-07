import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IndexedDbTrackMetadata } from '../player.types';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MetadataService } from '../metadata-service/metadata.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private readonly indexedDbService = inject(NgxIndexedDBService);
  private readonly metadataService = inject(MetadataService);

  readonly isLoading = signal<boolean>(false);
  readonly indexedDbTracks = signal<IndexedDbTrackMetadata[]>([]);

  async loadLibraryFromDb(): Promise<IndexedDbTrackMetadata[]> {
    try {
      this.isLoading.set(true);

      const result = await firstValueFrom(this.indexedDbService.getAll<IndexedDbTrackMetadata>('library'));

      // Parallele Verarbeitung für bessere Performance
      const tracksWithBlobUrls = result.map((track) =>
        this.metadataService.augmentObjectUrlForTagsEmbeddedPicture(track)
      );

      this.indexedDbTracks.set(tracksWithBlobUrls);
      return tracksWithBlobUrls;
    } catch (error) {
      console.error('Error loading library data:', error);
      this.indexedDbTracks.set([]);
      throw error; // Re-throw für Caller
    } finally {
      this.isLoading.set(false);
    }
  }
}
