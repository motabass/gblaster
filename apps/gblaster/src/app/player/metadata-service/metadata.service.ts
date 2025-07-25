import { computed, inject, Injectable, signal } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LocalStorageService } from 'ngx-webstorage';
import { firstValueFrom } from 'rxjs';
import { IndexedDbTrackMetadata, type Track, TrackMetadata } from '../player.types';
import { Id3TagsService } from './id3-tags.service';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { CoverColorPalette, RemoteCoverArtUrls } from './metadata.types';
import { MusicbrainzService } from './musicbrainz.service';
import { Vibrant } from 'node-vibrant/browser';
import { FileData } from '../file-loader-service/file-loader.helpers';
import { md5 } from 'hash-wasm';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly id3TagsService = inject(Id3TagsService);
  private readonly lastfmMetadataService = inject(LastfmMetadataService);
  private readonly musicbrainzService = inject(MusicbrainzService);
  private readonly indexedDBService = inject(NgxIndexedDBService);
  private readonly localStorageService = inject(LocalStorageService);

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

  async *addFilesToLibrary(...fileDatas: FileData[]): AsyncGenerator<Track> {
    if (fileDatas?.length) {
      this.totalFilesToProcess.set(fileDatas.length);
      this.filesToProcess.set(fileDatas.length);
      for (const fileData of fileDatas.values()) {
        this.processingFile.set(fileData.file.name);
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
    this.processingFile.set(fileData.file.name + ' - Generating hash...');
    const hash = await generateFileHash(fileData.file);

    if (this.useTagsCache()) {
      const metadataCache: TrackMetadata = await firstValueFrom(this.indexedDBService.getByKey<IndexedDbTrackMetadata>('library', hash));

      if (metadataCache) {
        if (
          metadataCache.embeddedPicture &&
          this.useTagEmbeddedPicture() &&
          (metadataCache.coverUrl.thumbUrl === this.PLACEHOLDER_URL || this.preferTagEmbeddedPicture())
        ) {
          // renew local object urls
          const url = URL.createObjectURL(new Blob([metadataCache.embeddedPicture.data], { type: metadataCache.embeddedPicture.format }));
          return {
            ...metadataCache,
            coverUrl: { thumbUrl: url, originalUrl: url } // overwrite remote url with objectUrl for tag cover art
          };
        } else {
          return this.createObjectUrlForEmbeddedPicture(metadataCache);
        }
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
      coverUrl: coverUrls ?? { thumbUrl: this.PLACEHOLDER_URL, originalUrl: this.PLACEHOLDER_URL },
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
    if (meta.embeddedPicture && this.useTagEmbeddedPicture() && (meta.coverUrl.originalUrl === this.PLACEHOLDER_URL || this.preferTagEmbeddedPicture())) {
      // renew local object urls
      if (meta.coverUrl?.originalUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(meta.coverUrl.originalUrl);
      }
      if (meta.coverUrl?.thumbUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(meta.coverUrl.thumbUrl);
      }
      // TODO: Erst kreieren wenn gebraucht!
      const url = URL.createObjectURL(new Blob([meta.embeddedPicture.data], { type: meta.embeddedPicture.format }));
      return {
        ...meta,
        coverUrl: { thumbUrl: url, originalUrl: url } // overwrite remote url with objectUrl for tag cover art
      };
    } else {
      return meta;
    }
  }
}

async function generateFileHash(file: File): Promise<string> {
  const fileSize = file.size;

  // For very small files, hash the entire content
  if (fileSize <= 256 * 1024) {
    // 256KB or less
    const buffer = await file.arrayBuffer();
    return await md5(new Uint8Array(buffer));
  }

  // Choose smaller chunk size based on file size
  const chunkSize = fileSize < 5 * 1024 * 1024 ? 64 * 1024 : 128 * 1024; // 64KB or 128KB

  const chunks: Uint8Array[] = [];

  // First chunk - contains headers in audio files
  const firstChunk = await file.slice(0, chunkSize).arrayBuffer();
  chunks.push(new Uint8Array(firstChunk));

  // For files larger than 1MB, sample the middle
  if (fileSize > 1024 * 1024) {
    const middlePos = Math.floor(fileSize / 2) - Math.floor(chunkSize / 2);
    const middleChunk = await file.slice(middlePos, middlePos + chunkSize).arrayBuffer();
    chunks.push(new Uint8Array(middleChunk));
  }

  // For files larger than 8MB, add quarter and three-quarter samples
  if (fileSize > 8 * 1024 * 1024) {
    const quarterPos = Math.floor(fileSize * 0.25);
    const quarterChunk = await file.slice(quarterPos, quarterPos + chunkSize).arrayBuffer();
    chunks.push(new Uint8Array(quarterChunk));

    const threeQuarterPos = Math.floor(fileSize * 0.75);
    const threeQuarterChunk = await file.slice(threeQuarterPos, threeQuarterPos + chunkSize).arrayBuffer();
    chunks.push(new Uint8Array(threeQuarterChunk));
  }

  // Last chunk - often contains important metadata in audio files
  const endChunk = await file.slice(Math.max(0, fileSize - chunkSize), fileSize).arrayBuffer();
  chunks.push(new Uint8Array(endChunk));

  // Combine all chunks into one array
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return await md5(combined);
}

async function extractColorsWithNodeVibrant(url: string): Promise<CoverColorPalette | undefined> {
  try {
    const palette = await Vibrant.from(url).getPalette();
    return {
      vibrant: { hex: palette.Vibrant?.hex, textHex: palette.Vibrant?.titleTextColor },
      darkVibrant: { hex: palette.DarkVibrant?.hex, textHex: palette.DarkVibrant?.titleTextColor },
      lightVibrant: { hex: palette.LightVibrant?.hex, textHex: palette.LightVibrant?.titleTextColor },
      muted: { hex: palette.Muted?.hex, textHex: palette.Muted?.titleTextColor },
      darkMuted: { hex: palette.DarkMuted?.hex, textHex: palette.DarkMuted?.titleTextColor },
      lightMuted: { hex: palette.LightMuted?.hex, textHex: palette.LightMuted?.titleTextColor }
    };
  } catch (error) {
    console.error('Error extracting colors with Vibrant:', error);
    return undefined;
  }
}
