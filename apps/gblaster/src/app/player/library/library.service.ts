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
      const currentTracks = this.indexedDbTracks();

      // Create a Map of existing tracks by hash for quick lookup
      const existingTracksMap = new Map(currentTracks.map((t) => [t.hash, t]));

      // Only create blob URLs for new tracks, reuse existing ones
      const tracksWithBlobUrls = result.map((track) => {
        const existingTrack = existingTracksMap.get(track.hash);

        // If track already exists with a cached blob URL, reuse it
        if (existingTrack?.cachedBlobUrl) {
          return {
            ...track,
            cachedBlobUrl: existingTrack.cachedBlobUrl,
            coverUrl: existingTrack.coverUrl
          };
        }

        // Create blob URL only for new tracks
        return this.metadataService.applyEmbeddedCoverObjectUrsl(track);
      });

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

  /**
   * Removes a single track from the library and cleans up its blob URL.
   */
  async removeTrack(hash: string): Promise<void> {
    const track = this.indexedDbTracks().find((t) => t.hash === hash);
    if (track) {
      this.metadataService.revokeBlobUrlForTrack(track);
      await firstValueFrom(this.indexedDbService.delete('library', hash));
      this.indexedDbTracks.set(this.indexedDbTracks().filter((t) => t.hash !== hash));
    }
  }

  /**
   * Clears the entire library and cleans up all blob URLs.
   */
  async clearLibrary(): Promise<void> {
    await firstValueFrom(this.indexedDbService.clear('library'));
    this.indexedDbTracks.set([]);
  }
}
