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
        const result = await this.getTrackMetadataFromCacheOrCalculate(fileData);
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

  private async getTrackMetadataFromCacheOrCalculate(fileData: FileData) {
    this.progressService.updateCurrentFile(fileData.file.name + ' - Generating hash...');
    const hash = await generateFileHash(fileData.file);
    let fromCache = false;
    const metadataCache: TrackMetadata = await firstValueFrom(
      this.indexedDBService.getByKey<IndexedDbTrackMetadata>('library', hash)
    );

    if (metadataCache) {
      fromCache = true;
      if (
        metadataCache.embeddedPicture &&
        this.useTagEmbeddedPicture() &&
        (metadataCache.coverUrl.thumbUrl === this.PLACEHOLDER_URL || this.preferTagEmbeddedPicture())
      ) {
        // renew local object urls
        const url = URL.createObjectURL(
          new Blob([metadataCache.embeddedPicture.data], {
            type: metadataCache.embeddedPicture.format
          })
        );
        const result: TrackMetadataResult = {
          metadata: {
            ...metadataCache,
            coverUrl: { thumbUrl: url, originalUrl: url } // overwrite remote url with objectUrl for tag cover art
          },
          fromCache
        };
        return result;
      } else {
        return {
          metadata: this.augmentObjectUrlForTagsEmbeddedPicture(metadataCache),
          fromCache
        } as TrackMetadataResult;
      }
    }

    this.progressService.updateCurrentFile(fileData.file.name + ' - Reading tags...');
    const tags = await this.id3TagsService.extractTags(fileData.file);

    if (!tags) {
      return undefined;
    }

    let coverUrls: RemoteCoverArtUrls | undefined;

    if (this.useWebMetainfos() && tags.artist && tags.album) {
      this.progressService.updateCurrentFile(fileData.file.name + ' - Getting cover pictures...');
      coverUrls = await this.lastfmMetadataService.getCoverPictureUrls(tags);
      if (!coverUrls) {
        coverUrls = await this.musicbrainzService.getCoverPictureUrls(tags);
      }
    }

    const metadata: IndexedDbTrackMetadata = {
      hash: hash,
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

    return { metadata, fromCache } as TrackMetadataResult;
  }

  augmentObjectUrlForTagsEmbeddedPicture(meta: TrackMetadata): TrackMetadata {
    if (
      meta.embeddedPicture &&
      this.useTagEmbeddedPicture() &&
      (meta.coverUrl.originalUrl === this.PLACEHOLDER_URL || this.preferTagEmbeddedPicture())
    ) {
      // renew local object urls
      if (meta.coverUrl?.originalUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(meta.coverUrl.originalUrl);
      }
      if (meta.coverUrl?.thumbUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(meta.coverUrl.thumbUrl);
      }
      // TODO: Erst kreieren wenn gebraucht!
      const url = URL.createObjectURL(
        new Blob([meta.embeddedPicture.data], {
          type: meta.embeddedPicture.format
        })
      );
      return {
        ...meta,
        coverUrl: { thumbUrl: url, originalUrl: url } // overwrite remote url with objectUrl for tag cover art
      };
    } else {
      return meta;
    }
  }
}
