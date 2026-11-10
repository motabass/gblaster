import { inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IndexedDbTrackMetadata } from '../player.types';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MetadataService } from '../metadata-service/metadata.service';

/**
Loads and removes track metadata stored in the IndexedDB music library.
*/
@Service()
export class LibraryService {
  readonly #indexedDbService = inject(NgxIndexedDBService);
  readonly #metadataService = inject(MetadataService);

  readonly #isLoading = signal<boolean>(false);
  readonly isLoading = this.#isLoading.asReadonly();
  readonly #indexedDbTracks = signal<IndexedDbTrackMetadata[]>([]);
  readonly indexedDbTracks = this.#indexedDbTracks.asReadonly();

  /**
  Loads all library records and reuses or creates embedded-cover blob URLs.
  */
  async loadLibraryFromDb(): Promise<IndexedDbTrackMetadata[]> {
    try {
      this.#isLoading.set(true);

      const result = await firstValueFrom(this.#indexedDbService.getAll<IndexedDbTrackMetadata>('library'));
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
        return this.#metadataService.applyEmbeddedCoverObjectUrsl(track);
      });

      this.#indexedDbTracks.set(tracksWithBlobUrls);
      return tracksWithBlobUrls;
    } catch (error) {
      console.error('Error loading library data:', error);
      this.#indexedDbTracks.set([]);
      throw error; // Re-throw für Caller
    } finally {
      this.#isLoading.set(false);
    }
  }

  /**
  Clears every library record and removes them from the in-memory track list.
  */
  async clearLibrary(): Promise<void> {
    await firstValueFrom(this.#indexedDbService.clear('library'));
    this.#indexedDbTracks.set([]);
  }

  /**
  Deletes the given tracks from IndexedDB and releases their cover blob URLs.
  @param tracks Tracks to delete from the library.
  */
  async removeTracks(tracks: IndexedDbTrackMetadata[]): Promise<void> {
    await Promise.all(tracks.map((track) => firstValueFrom(this.#indexedDbService.delete('library', track.hash))));

    for (const track of tracks) {
      this.#metadataService.revokeBlobUrlForTrack(track);
    }

    const removedHashes = new Set(tracks.map((track) => track.hash));
    this.#indexedDbTracks.set(this.indexedDbTracks().filter((track) => !removedHashes.has(track.hash)));
  }
}
