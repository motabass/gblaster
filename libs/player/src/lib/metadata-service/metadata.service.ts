import { crc32 } from '@allex/crc32';
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import Vibrant from 'node-vibrant/lib/browser';
import { SongMetadata } from '../player.types';
import { Id3TagsService } from './id3-tags.service';
import { Id3CoverPicture } from './id3-tags.types';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { CoverColorPalette, RemoteCoverPicture } from './metadata.types';
import { MusicbrainzService } from './musicbrainz.service';

@Injectable({ providedIn: 'any' })
export class MetadataService {
  private readonly PLACEHOLDER_URL = 'assets/icons/record.svg';

  constructor(
    private id3TagsService: Id3TagsService,
    private lastfmMetadataService: LastfmMetadataService,
    private musicbrainzService: MusicbrainzService,
    private indexedDBService: NgxIndexedDBService
  ) {}

  async getMetadata(file: File): Promise<SongMetadata> {
    const crc = generateFileHash(file);

    const metadataCache: SongMetadata = await this.indexedDBService.getByKey('metatags', crc).toPromise();

    if (metadataCache) {
      if (metadataCache.coverUrl?.original.startsWith('blob:') && metadataCache.embeddedPicture) {
        const url = URL.createObjectURL(new Blob([metadataCache.embeddedPicture.data], { type: metadataCache.embeddedPicture.format }));
        return {
          ...metadataCache,
          coverUrl: { thumb: url, original: url }
        };
      } else {
        return metadataCache;
      }
    }

    const tags = await this.id3TagsService.extractTags(file);

    let coverUrl: RemoteCoverPicture | undefined;

    coverUrl = tags ? await this.lastfmMetadataService.getCoverPicture(tags) : undefined;
    if (!coverUrl) {
      coverUrl = tags ? await this.musicbrainzService.getCoverPicture(tags) : undefined;
    }

    const pic: Id3CoverPicture | undefined = tags?.picture;

    if (!coverUrl && pic) {
      const url = URL.createObjectURL(new Blob([pic.data], { type: pic.format }));

      coverUrl = { thumb: url, original: url };
    }

    const palette: CoverColorPalette | undefined = coverUrl ? await extractColors(coverUrl.original) : undefined;

    const metadata: SongMetadata = {
      crc: crc,
      coverUrl: coverUrl ? coverUrl : { thumb: this.PLACEHOLDER_URL, original: this.PLACEHOLDER_URL },
      embeddedPicture: pic,
      coverColors: palette,
      artist: tags?.artist,
      title: tags?.title,
      track: tags?.track?.no?.toString(),
      album: tags?.album,
      year: tags?.year
    };

    this.indexedDBService.add('metatags', metadata);

    return metadata;
  }
}

function generateFileHash(file: File): string {
  const hashString: string = file.name + file.type + file.size + file.lastModified;
  return crc32(hashString, 'hex') as string;
}

async function extractColors(url: string): Promise<CoverColorPalette> {
  // @ts-ignore
  const vibrant: typeof Vibrant = await import('node-vibrant/lib/browser');
  const palette = await vibrant.from(url).getPalette();

  return {
    vibrant: { hex: palette.Vibrant?.hex, textHex: palette.Vibrant?.titleTextColor },
    darkVibrant: { hex: palette.DarkVibrant?.hex, textHex: palette.DarkVibrant?.titleTextColor },
    lightVibrant: { hex: palette.LightVibrant?.hex, textHex: palette.LightVibrant?.titleTextColor },
    muted: { hex: palette.Muted?.hex, textHex: palette.Muted?.titleTextColor },
    darkMuted: { hex: palette.DarkMuted?.hex, textHex: palette.DarkMuted?.titleTextColor },
    lightMuted: { hex: palette.LightMuted?.hex, textHex: palette.LightMuted?.titleTextColor }
  };
}
