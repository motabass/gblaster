import { inject, Injectable, signal } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LocalStorageService } from 'ngx-webstorage';
import { firstValueFrom } from 'rxjs';
import { IndexedDbTrackMetadata, type Track, TrackMetadata, TrackMetadataResult } from '../player.types';
import { Id3TagsService } from './id3-tags.service';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { RemoteCoverArtUrls } from './metadata.types';
import { MusicbrainzService } from './musicbrainz.service';
import { FileData } from '../file-loader-service/file-loader.helpers';
import { generateFileHash } from './metadata-helper';
import { ProgressService } from './progress.service';
import { Id3CoverPicture, Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  readonly #id3TagsService = inject(Id3TagsService);
  readonly #lastfmMetadataService = inject(LastfmMetadataService);
  readonly #musicbrainzService = inject(MusicbrainzService);
  readonly #indexedDBService = inject(NgxIndexedDBService);
  readonly #localStorageService = inject(LocalStorageService);
  readonly #progressService = inject(ProgressService);

  readonly #PLACEHOLDER_URL = 'assets/icons/record.svg';

  readonly #useWebMetainfos = signal(this.#localStorageService.retrieve('useWebMetainfos') ?? true);
  readonly useWebMetainfos = this.#useWebMetainfos.asReadonly();
  readonly #useTagEmbeddedPicture = signal(this.#localStorageService.retrieve('useTagEmbeddedPicture') ?? true);
  readonly useTagEmbeddedPicture = this.#useTagEmbeddedPicture.asReadonly();
  readonly #preferTagEmbeddedPicture = signal(this.#localStorageService.retrieve('preferTagEmbeddedPicture') ?? true);
  readonly preferTagEmbeddedPicture = this.#preferTagEmbeddedPicture.asReadonly();

  setUseWebMetainfos(value: boolean) {
    this.#useWebMetainfos.set(value);
    this.#localStorageService.store('useWebMetainfos', value);
  }

  setUseTagEmbeddedPicture(value: boolean) {
    this.#useTagEmbeddedPicture.set(value);
    this.#localStorageService.store('useTagEmbeddedPicture', value);
  }

  setPreferTagEmbeddedPicture(value: boolean) {
    this.#preferTagEmbeddedPicture.set(value);
    this.#localStorageService.store('preferTagEmbeddedPicture', value);
  }

  async *addFilesToLibrary(fileDatas: FileData[]) {
    if (!fileDatas?.length) {
      return;
    }

    this.#progressService.startProcessing(fileDatas.length);
    for (const fileData of fileDatas) {
      this.#progressService.updateCurrentFile(fileData.file.name);
      const result = await this.#getTrackMetadataFromCacheOrExtract(fileData);
      if (!result?.metadata) {
        this.#progressService.completeFile();
        continue;
      }
      if (!result.fromCache) {
        await this.#addMetadataToIndexedDb(result.metadata);
      }

      const track: Track = {
        file: fileData.file,
        fileHandle: fileData.fileHandle,
        metadata: result.metadata
      };
      this.#progressService.completeFile();
      yield track;
    }
    this.#progressService.reset();
  }

  async #addMetadataToIndexedDb(metadata: TrackMetadata) {
    const { cachedBlobUrl, ...metadataToStore } = metadata;
    // Never persist cachedBlobUrl - blob URLs are session-specific
    await firstValueFrom(this.#indexedDBService.add('library', metadataToStore));
  }

  async #getTrackMetadataFromCacheOrExtract(fileData: FileData): Promise<TrackMetadataResult | undefined> {
    this.#progressService.updateCurrentFile(fileData.file.name + ' - Generating hash...');
    const hash = await generateFileHash(fileData.file);

    const metadataCache = await firstValueFrom(
      this.#indexedDBService.getByKey<IndexedDbTrackMetadata>('library', hash)
    );

    if (metadataCache) {
      const metadata = this.applyEmbeddedCoverObjectUrsl(metadataCache);
      return { metadata, fromCache: true };
    }

    return this.#extractTrackMetadata(fileData, hash);
  }

  async #extractTrackMetadata(fileData: FileData, hash: string): Promise<TrackMetadataResult | undefined> {
    this.#progressService.updateCurrentFile(fileData.file.name + ' - Reading tags...');
    const tags = await this.#id3TagsService.extractTags(fileData.file);

    if (!tags) {
      return undefined;
    }

    const coverUrls = await this.#fetchRemoteCoverUrls(fileData.file.name, tags);

    const metadata: IndexedDbTrackMetadata = {
      hash,
      fileName: fileData.file.name,
      fileHandle: fileData.fileHandle,
      coverUrl: coverUrls ?? {
        thumbUrl: this.#PLACEHOLDER_URL,
        originalUrl: this.#PLACEHOLDER_URL
      },
      embeddedPicture: tags.picture,
      artist: tags.artist,
      title: tags.title,
      track: tags.track?.no?.toString(),
      album: tags.album,
      year: tags.year,
      format: tags.format
    };

    return { metadata: this.applyEmbeddedCoverObjectUrsl(metadata), fromCache: false };
  }

  async #fetchRemoteCoverUrls(fileName: string, tags: Id3Tags): Promise<RemoteCoverArtUrls | undefined> {
    if (!this.useWebMetainfos() || !tags.artist || !tags.album) {
      return undefined;
    }

    this.#progressService.updateCurrentFile(fileName + ' - Getting cover pictures...');
    const coverUrls = await this.#lastfmMetadataService.getCoverPictureUrls(tags);
    return coverUrls ? coverUrls : this.#musicbrainzService.getCoverPictureUrls(tags);
  }

  #shouldUseEmbeddedPicture(metadata: TrackMetadata): boolean {
    return !!(
      metadata.embeddedPicture &&
      this.useTagEmbeddedPicture() &&
      (metadata.coverUrl.thumbUrl === this.#PLACEHOLDER_URL || this.preferTagEmbeddedPicture())
    );
  }

  #createObjectUrlFromEmbeddedPicture(embeddedPicture: Id3CoverPicture): string {
    const blob = new Blob([embeddedPicture.data], { type: embeddedPicture.format });
    return URL.createObjectURL(blob);
  }

  applyEmbeddedCoverObjectUrsl(meta: TrackMetadata): TrackMetadata {
    if (!this.#shouldUseEmbeddedPicture(meta)) {
      return meta;
    }

    // Reuse cached blob URL if it exists to prevent creating duplicates
    if (meta.cachedBlobUrl) {
      return {
        ...meta,
        coverUrl: { thumbUrl: meta.cachedBlobUrl, originalUrl: meta.cachedBlobUrl }
      };
    }

    // Create new blob URL and cache it
    const objectUrl = this.#createObjectUrlFromEmbeddedPicture(meta.embeddedPicture!);
    return {
      ...meta,
      cachedBlobUrl: objectUrl,
      coverUrl: { thumbUrl: objectUrl, originalUrl: objectUrl }
    };
  }

  /**
  Revokes blob URLs for tracks with embedded pictures.
  Call this when:
  - Removing tracks from library
  - Clearing the entire library
    for (const track of tracks) {
  */
  revokeBlobUrlsForTracks(tracks: TrackMetadata[]): void {
    for (const track of tracks) {
      if (!track.cachedBlobUrl) {
        continue;
      }

      URL.revokeObjectURL(track.cachedBlobUrl);
      track.cachedBlobUrl = undefined;
    }
  }

  /**
  Revokes blob URL for a single track.
  Call this when removing a single track from library.
  */
  revokeBlobUrlForTrack(track: TrackMetadata): void {
    if (!track.cachedBlobUrl) {
      return;
    }

    URL.revokeObjectURL(track.cachedBlobUrl);
    track.cachedBlobUrl = undefined;
  }
}
