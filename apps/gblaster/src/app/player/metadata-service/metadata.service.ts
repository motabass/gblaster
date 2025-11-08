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

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly id3TagsService = inject(Id3TagsService);
  private readonly lastfmMetadataService = inject(LastfmMetadataService);
  private readonly musicbrainzService = inject(MusicbrainzService);
  private readonly indexedDBService = inject(NgxIndexedDBService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly progressService = inject(ProgressService);

  private readonly PLACEHOLDER_URL = 'assets/icons/record.svg';

  readonly useWebMetainfos = signal(this.localStorageService.retrieve('useWebMetainfos') ?? true);
  readonly useTagEmbeddedPicture = signal(this.localStorageService.retrieve('useTagEmbeddedPicture') ?? true);
  readonly preferTagEmbeddedPicture = signal(this.localStorageService.retrieve('preferTagEmbeddedPicture') ?? true);

  async *addFilesToLibrary(fileDatas: FileData[]) {
    if (fileDatas?.length) {
      this.progressService.startProcessing(fileDatas.length);
      for (const fileData of fileDatas.values()) {
        this.progressService.updateCurrentFile(fileData.file.name);
        const result = await this.getTrackMetadataFromCacheOrExtract(fileData);
        if (!result?.metadata) {
          this.progressService.completeFile();
          continue;
        }
        if (!result.fromCache) {
          await this.addMetadataToIndexedDb(result.metadata);
        }

        const track: Track = {
          file: fileData.file,
          fileHandle: fileData.fileHandle,
          metadata: result.metadata
        };
        this.progressService.completeFile();
        yield track;
      }
      this.progressService.reset();
    }
  }

  private async addMetadataToIndexedDb(metadata: TrackMetadata) {
    await firstValueFrom(this.indexedDBService.add('library', metadata));
  }

  private async getTrackMetadataFromCacheOrExtract(fileData: FileData): Promise<TrackMetadataResult | undefined> {
    this.progressService.updateCurrentFile(fileData.file.name + ' - Generating hash...');
    const hash = await generateFileHash(fileData.file);

    const metadataCache = await firstValueFrom(this.indexedDBService.getByKey<IndexedDbTrackMetadata>('library', hash));

    if (metadataCache) {
      const metadata = this.applyEmbeddedPictureCoverUrl(metadataCache);
      return { metadata, fromCache: true };
    }

    return this.extractTrackMetadata(fileData, hash);
  }

  private async extractTrackMetadata(fileData: FileData, hash: string): Promise<TrackMetadataResult | undefined> {
    this.progressService.updateCurrentFile(fileData.file.name + ' - Reading tags...');
    const tags = await this.id3TagsService.extractTags(fileData.file);

    if (!tags) {
      return undefined;
    }

    const coverUrls = await this.fetchRemoteCoverUrls(fileData.file.name, tags);

    const metadata: IndexedDbTrackMetadata = {
      hash,
      fileName: fileData.file.name,
      fileHandle: fileData.fileHandle,
      coverUrl: coverUrls ?? {
        thumbUrl: this.PLACEHOLDER_URL,
        originalUrl: this.PLACEHOLDER_URL
      },
      embeddedPicture: tags.picture,
      artist: tags.artist,
      title: tags.title,
      track: tags.track?.no?.toString(),
      album: tags.album,
      year: tags.year,
      format: tags.format
    };

    return { metadata, fromCache: false };
  }

  private async fetchRemoteCoverUrls(fileName: string, tags: any): Promise<RemoteCoverArtUrls | undefined> {
    if (!this.useWebMetainfos() || !tags.artist || !tags.album) {
      return undefined;
    }

    this.progressService.updateCurrentFile(fileName + ' - Getting cover pictures...');
    const coverUrls = await this.lastfmMetadataService.getCoverPictureUrls(tags);
    if (coverUrls) {
      return coverUrls;
    }

    return this.musicbrainzService.getCoverPictureUrls(tags);
  }

  private applyEmbeddedPictureCoverUrl(metadata: TrackMetadata): TrackMetadata {
    if (!this.shouldUseEmbeddedPicture(metadata)) {
      return metadata;
    }

    const objectUrl = this.createObjectUrlFromEmbeddedPicture(metadata.embeddedPicture!);
    return {
      ...metadata,
      coverUrl: { thumbUrl: objectUrl, originalUrl: objectUrl }
    };
  }

  private shouldUseEmbeddedPicture(metadata: TrackMetadata): boolean {
    return !!(
      metadata.embeddedPicture &&
      this.useTagEmbeddedPicture() &&
      (metadata.coverUrl.thumbUrl === this.PLACEHOLDER_URL || this.preferTagEmbeddedPicture())
    );
  }

  private createObjectUrlFromEmbeddedPicture(embeddedPicture: any): string {
    const blob = new Blob([embeddedPicture.data], { type: embeddedPicture.format });
    return URL.createObjectURL(blob);
  }

  augmentObjectUrlForTagsEmbeddedPicture(meta: TrackMetadata): TrackMetadata {
    if (!this.shouldUseEmbeddedPicture(meta)) {
      return meta;
    }

    this.revokeExistingObjectUrls(meta.coverUrl);

    // TODO: Erst kreieren wenn gebraucht!
    const objectUrl = this.createObjectUrlFromEmbeddedPicture(meta.embeddedPicture!);
    return {
      ...meta,
      coverUrl: { thumbUrl: objectUrl, originalUrl: objectUrl }
    };
  }

  private revokeExistingObjectUrls(coverUrl: RemoteCoverArtUrls): void {
    if (coverUrl?.originalUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(coverUrl.originalUrl);
    }
    if (coverUrl?.thumbUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(coverUrl.thumbUrl);
    }
  }
}
