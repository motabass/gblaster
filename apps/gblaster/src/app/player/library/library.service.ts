import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IndexedDbTrackMetadata } from '../player.types';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MetadataService } from '../metadata-service/metadata.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private indexedDbService = inject(NgxIndexedDBService);
  private metadataService = inject(MetadataService);

  readonly isLoading = signal<boolean>(false);

  readonly indexedDbTracks = signal<IndexedDbTrackMetadata[]>([]);

  async loadLibraryFromDb() {
    return this.loadFromDb();
  }

  private async loadFromDb() {
    try {
      this.isLoading.set(true);
      const result = await firstValueFrom(this.indexedDbService.getAll<IndexedDbTrackMetadata>('library'));
      const tagsWithOptionalBlobUrls = result.map((tag) => {
        return this.metadataService.createObjectUrlForEmbeddedPicture(tag);
      });

      this.indexedDbTracks.set(tagsWithOptionalBlobUrls || []);
      this.isLoading.set(false);
    } catch (error) {
      console.error('Error loading library data:', error);
    }
  }
}
