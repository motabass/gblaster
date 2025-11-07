import { computed, inject, Injectable, signal } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LocalStorageService } from 'ngx-webstorage';
import { firstValueFrom } from 'rxjs';
import { IndexedDbTrackMetadata, type Track, TrackMetadata } from '../player.types';
import { Id3TagsService } from './id3-tags.service';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { CoverColorPalette, RemoteCoverArtUrls } from './metadata.types';
import { MusicbrainzService } from './musicbrainz.service';
import { FileData } from '../file-loader-service/file-loader.helpers';
import { extractColorsWithNodeVibrant, generateFileHash } from './metadata-helper';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly id3TagsService = inject(Id3TagsService);
  private readonly lastfmMetadataService = inject(LastfmMetadataService);
  private readonly musicbrainzService = inject(MusicbrainzService);
  private readonly indexedDBService = inject(NgxIndexedDBService);
  private readonly localStorageService = inject(LocalStorageService);

  private readonly PLACEHOLDER_URL = 'assets/icons/record.svg';

  readonly useWebMetainfos = signal(this.localStorageService.retrieve('useWebMetainfos') ?? true);
  readonly useTagEmbeddedPicture = signal(this.localStorageService.retrieve('useTagEmbeddedPicture') ?? true);
  readonly preferTagEmbeddedPicture = signal(this.localStorageService.retrieve('preferTagEmbeddedPicture') ?? true);

  private readonly totalFilesToProcess = signal(0);
  private readonly filesToProcess = signal(0);
  readonly processionPercent = computed(() => {
    return 100 - (this.filesToProcess() / this.totalFilesToProcess()) * 100;
  });

  readonly processing = computed(() => {
    return this.filesToProcess() > 0;
  });

  readonly processingFile = signal('');

  readonly statusText = computed(() => {
    const totalFilesToProcess = this.totalFilesToProcess();
    let text = `Processing (${totalFilesToProcess - this.filesToProcess()} / ${totalFilesToProcess}): `;
    text += this.processing() ? this.processingFile() : 'Finished';
    return text;
  });

  async *addFilesToLibrary(fileDatas: FileData[]) {
    if (fileDatas?.length) {
      this.totalFilesToProcess.set(fileDatas.length);
      this.filesToProcess.set(fileDatas.length);
      for (const fileData of fileDatas.values()) {
        this.processingFile.set(fileData.file.name);
        const track = await this.createTrackAndSaveToLibrary(fileData);
        if (track) {
          yield track;
        }
        this.filesToProcess.update((files) => files - 1);
      }
      this.totalFilesToProcess.set(0);
    }
  }

  private async createTrackAndSaveToLibrary(fileData: FileData): Promise<Track | undefined> {
    // console.time('full-metadata');
    const metadata = await this.getTrackMetadata(fileData);
    // console.timeEnd('full-metadata');

    if (!metadata) {
      return undefined;
    }

    await firstValueFrom(this.indexedDBService.add('library', metadata));

    const metadataWithObjectUrl = this.augmentObjectUrlForTagsEmbeddedPicture(metadata);
    return {
      file: fileData.file,
      fileHandle: fileData.fileHandle,
      metadata: metadataWithObjectUrl
    };
  }

  private async getTrackMetadata(fileData: FileData): Promise<TrackMetadata | undefined> {
    this.processingFile.set(fileData.file.name + ' - Generating hash...');
    const hash = await generateFileHash(fileData.file);

    const metadataCache: TrackMetadata = await firstValueFrom(
      this.indexedDBService.getByKey<IndexedDbTrackMetadata>('library', hash)
    );

    if (metadataCache) {
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
        return {
          ...metadataCache,
          coverUrl: { thumbUrl: url, originalUrl: url } // overwrite remote url with objectUrl for tag cover art
        };
      } else {
        return this.augmentObjectUrlForTagsEmbeddedPicture(metadataCache);
      }
    }

    this.processingFile.set(fileData.file.name + ' - Reading tags...');
    const tags = await this.id3TagsService.extractTags(fileData.file);

    if (!tags) {
      return undefined;
    }

    let coverUrls: RemoteCoverArtUrls | undefined;

    if (this.useWebMetainfos() && tags.artist && tags.album) {
      this.processingFile.set(fileData.file.name + ' - Getting cover pictures...');
      coverUrls = await this.lastfmMetadataService.getCoverPictureUrls(tags);
      if (!coverUrls) {
        coverUrls = await this.musicbrainzService.getCoverPictureUrls(tags);
      }
    }

    let palette: CoverColorPalette | undefined;
    this.processingFile.set(fileData.file.name + ' - Reading colors...');
    if (coverUrls?.originalUrl) {
      palette = await extractColorsWithNodeVibrant(coverUrls.originalUrl);
    } else if (tags.picture) {
      const objectUrl = URL.createObjectURL(new Blob([tags.picture.data], { type: tags.picture.format }));
      palette = await extractColorsWithNodeVibrant(objectUrl);
      URL.revokeObjectURL(objectUrl);
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
      coverColors: palette || {},
      artist: tags.artist,
      title: tags.title,
      track: tags.track?.no?.toString(),
      album: tags.album,
      year: tags.year,
      format: tags.format
    };

    return metadata;
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
