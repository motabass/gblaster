import { computed, inject, Injectable, signal } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LocalStorageService } from 'ngx-webstorage';
import { firstValueFrom } from 'rxjs';
import { IndexedDbTrackMetadata, type Track, TrackMetadata } from '../player.types';
import { Id3TagsService } from './id3-tags.service';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { CoverColorPalette, RemoteCoverPicture } from './metadata.types';
import { MusicbrainzService } from './musicbrainz.service';
import { Vibrant } from 'node-vibrant/browser';
import { FileData } from '../file-loader-service/file-loader.helpers';
import SparkMD5 from 'spark-md5';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private id3TagsService = inject(Id3TagsService);
  private lastfmMetadataService = inject(LastfmMetadataService);
  private musicbrainzService = inject(MusicbrainzService);
  private indexedDBService = inject(NgxIndexedDBService);
  private localStorageService = inject(LocalStorageService);

  private readonly PLACEHOLDER_URL = 'assets/icons/record.svg';

  readonly useWebMetainfos = signal(this.localStorageService.retrieve('useWebMetainfos') ?? true);
  readonly useTagsCache = signal(this.localStorageService.retrieve('useTagsCache') ?? true);
  readonly useTagEmbeddedPicture = signal(this.localStorageService.retrieve('useTagEmbeddedPicture') ?? true);
  readonly preferTagEmbeddedPicture = signal(this.localStorageService.retrieve('preferTagEmbeddedPicture') ?? true);

  private readonly totalFilesToProcess = signal(0);
  private readonly filesToProcess = signal(0);
  readonly processionPercent = computed(() => {
    return 100 - (this.filesToProcess() / this.totalFilesToProcess()) * 100;
  });

  async *addFilesToLibrary(...fileDatas: FileData[]): AsyncGenerator<Track> {
    if (fileDatas?.length) {
      this.totalFilesToProcess.set(fileDatas.length);
      this.filesToProcess.set(fileDatas.length);
      for (const fileData of fileDatas.values()) {
        const track = await this.createTrackFromFile(fileData);
        if (track) {
          yield track; // Yield each track as soon as it's ready
        }
        this.filesToProcess.update((files) => files - 1);
      }
      this.totalFilesToProcess.set(0);
    }
  }

  async createTrackFromFile(fileData: FileData): Promise<Track | undefined> {
    // console.time('full-metadata');
    const metadata = await this.getMetadata(fileData);
    // console.timeEnd('full-metadata');

    if (!metadata) {
      return undefined;
    }
    return {
      file: fileData.file,
      fileHandle: fileData.fileHandle,
      metadata: metadata
    };
  }

  async getMetadata(fileData: FileData): Promise<TrackMetadata | undefined> {
    // console.time('hash');
    const hash = await generateFileHash(fileData.file);
    // console.timeEnd('hash');

    if (this.useTagsCache()) {
      const metadataCache: TrackMetadata = await firstValueFrom(this.indexedDBService.getByKey<IndexedDbTrackMetadata>('library', hash));

      if (metadataCache) {
        if (
          metadataCache.embeddedPicture &&
          this.useTagEmbeddedPicture() &&
          (metadataCache.coverUrl.thumb === this.PLACEHOLDER_URL || this.preferTagEmbeddedPicture())
        ) {
          // renew local object urls
          const url = URL.createObjectURL(new Blob([metadataCache.embeddedPicture.data], { type: metadataCache.embeddedPicture.format }));
          return {
            ...metadataCache,
            coverUrl: { thumb: url, original: url } // overwrite remote url with objectUrl for tag cover art
          };
        } else {
          return this.createObjectUrlForEmbeddedPicture(metadataCache);
        }
      }
    }
    // console.time('id3tags');
    const tags = await this.id3TagsService.extractTags(fileData.file);
    // console.timeEnd('id3tags');
    if (!tags) {
      // if no tags
      return undefined;
    }

    let coverUrls: RemoteCoverPicture | undefined;

    if (this.useWebMetainfos()) {
      if (tags.artist && tags.album) {
        // console.time('webcover');
        coverUrls = await this.lastfmMetadataService.getCoverPictureUrls(tags);
        if (!coverUrls) {
          coverUrls = await this.musicbrainzService.getCoverPictureUrls(tags);
        }
        // console.timeEnd('webcover');
      } else {
        // console.warn('Missing tags for lookup');
      }
    }

    let palette: CoverColorPalette | undefined;

    if (coverUrls?.original) {
      // console.time('vibrant');
      palette = await extractColorsWithNodeVibrant(coverUrls.original);
      // console.timeEnd('vibrant');
    } else if (tags.picture) {
      // console.time('vibrant');
      const objectUrl = URL.createObjectURL(new Blob([tags.picture.data], { type: tags.picture.format }));
      palette = await extractColorsWithNodeVibrant(objectUrl);
      URL.revokeObjectURL(objectUrl);
      // console.timeEnd('vibrant');
    }

    const metadata: IndexedDbTrackMetadata = {
      hash: hash,
      fileName: fileData.file.name,
      fileHandle: fileData.fileHandle,
      coverUrl: coverUrls ?? { thumb: this.PLACEHOLDER_URL, original: this.PLACEHOLDER_URL },
      embeddedPicture: tags.picture,
      coverColors: palette || {},
      artist: tags.artist,
      title: tags.title,
      track: tags.track?.no?.toString(),
      album: tags.album,
      year: tags.year,
      format: tags.format
    };

    if (this.useTagsCache()) {
      await this.indexedDBService.add('library', metadata).toPromise();
    }
    return this.createObjectUrlForEmbeddedPicture(metadata);
  }

  createObjectUrlForEmbeddedPicture(meta: TrackMetadata): TrackMetadata {
    if (meta.embeddedPicture && this.useTagEmbeddedPicture() && (meta.coverUrl.original === this.PLACEHOLDER_URL || this.preferTagEmbeddedPicture())) {
      // renew local object urls
      if (meta.coverUrl.original.startsWith('blob:')) {
        URL.revokeObjectURL(meta.coverUrl.original);
      }
      if (meta.coverUrl.thumb.startsWith('blob:')) {
        URL.revokeObjectURL(meta.coverUrl.thumb);
      }
      // TODO: Erst kreieren wenn gebraucht!
      const url = URL.createObjectURL(new Blob([meta.embeddedPicture.data], { type: meta.embeddedPicture.format }));
      return {
        ...meta,
        coverUrl: { thumb: url, original: url } // overwrite remote url with objectUrl for tag cover art
      };
    } else {
      return meta;
    }
  }
}

async function generateFileHash(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer();
  const fileSize = file.size;

  // For very small files, hash the entire content
  if (fileSize <= 256 * 1024) {
    // 256KB or less
    const buffer = await file.arrayBuffer();
    spark.append(buffer);
    return spark.end();
  }

  // Choose smaller chunk size based on file size
  const chunkSize = fileSize < 5 * 1024 * 1024 ? 64 * 1024 : 128 * 1024; // 64KB or 128KB

  // First chunk - contains headers in audio files
  const firstChunk = await file.slice(0, chunkSize).arrayBuffer();
  spark.append(firstChunk);

  // For files larger than 1MB, sample the middle
  if (fileSize > 1 * 1024 * 1024) {
    const middlePos = Math.floor(fileSize / 2) - Math.floor(chunkSize / 2);
    const middleChunk = await file.slice(middlePos, middlePos + chunkSize).arrayBuffer();
    spark.append(middleChunk);
  }

  // For files larger than 8MB, add quarter and three-quarter samples
  if (fileSize > 8 * 1024 * 1024) {
    const quarterPos = Math.floor(fileSize * 0.25);
    const quarterChunk = await file.slice(quarterPos, quarterPos + chunkSize).arrayBuffer();
    spark.append(quarterChunk);

    const threeQuarterPos = Math.floor(fileSize * 0.75);
    const threeQuarterChunk = await file.slice(threeQuarterPos, threeQuarterPos + chunkSize).arrayBuffer();
    spark.append(threeQuarterChunk);
  }

  // Last chunk - often contains important metadata in audio files
  const endChunk = await file.slice(Math.max(0, fileSize - chunkSize), fileSize).arrayBuffer();
  spark.append(endChunk);

  return spark.end();
}

async function extractColorsWithNodeVibrant(url: string): Promise<CoverColorPalette> {
  const palette = await Vibrant.from(url).getPalette();
  return {
    vibrant: { hex: palette.Vibrant?.hex, textHex: palette.Vibrant?.titleTextColor },
    darkVibrant: { hex: palette.DarkVibrant?.hex, textHex: palette.DarkVibrant?.titleTextColor },
    lightVibrant: { hex: palette.LightVibrant?.hex, textHex: palette.LightVibrant?.titleTextColor },
    muted: { hex: palette.Muted?.hex, textHex: palette.Muted?.titleTextColor },
    darkMuted: { hex: palette.DarkMuted?.hex, textHex: palette.DarkMuted?.titleTextColor },
    lightMuted: { hex: palette.LightMuted?.hex, textHex: palette.LightMuted?.titleTextColor }
  };
}
