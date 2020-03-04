import { crc32 } from '@allex/crc32';
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import Vibrant from 'node-vibrant/lib/browser.worker';
import { SongMetadata } from '../player.types';
import { ID3TagsService } from './id3-tags.service.abstract';
import { CoverPicture } from './id3-tags.types';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { CoverColorPalette } from './metadata.types';

// https://www.npmjs.com/package/id3-writer
// https://github.com/Zazama/node-id3
// https://github.com/borewit/music-metadata
// more web apis? -> FREEDB; MUSICbRAINZ

@Injectable({ providedIn: 'any' })
export class MetadataService {
  private readonly PLACEHOLDER_URL = 'assets/icons/record.svg';

  constructor(private id3TagsService: ID3TagsService, private lastfmMetadataService: LastfmMetadataService, private indexedDBService: NgxIndexedDBService) {}

  async getMetadata(file: File): Promise<SongMetadata> {
    const crc = generateFileHash(file);

    const metadataCache: SongMetadata = await this.indexedDBService.getByKey('metatags', crc);

    if (metadataCache) {
      if (metadataCache.coverUrl?.startsWith('blob:') && metadataCache.embeddedPicture) {
        return {
          ...metadataCache,
          coverUrl: URL.createObjectURL(new Blob([metadataCache.embeddedPicture.data], { type: metadataCache.embeddedPicture.format }))
        };
      } else {
        return metadataCache;
      }
    }

    const tags = await this.id3TagsService.extractTags(file);

    let coverUrl = tags ? await this.lastfmMetadataService.getCoverArtFromLastFM(tags) : undefined;

    const pic: CoverPicture | undefined = tags?.picture ? { format: tags.picture.format, data: new Uint8Array(tags.picture.data) } : undefined;

    if (!coverUrl && pic) {
      coverUrl = URL.createObjectURL(new Blob([pic.data], { type: pic.format }));
    }

    const palette: CoverColorPalette | undefined = coverUrl ? await extractColors(coverUrl) : undefined;

    const metadata: SongMetadata = {
      crc: crc,
      coverUrl: coverUrl ? coverUrl : this.PLACEHOLDER_URL,
      embeddedPicture: pic,
      coverColors: palette,
      artist: tags?.artist,
      title: tags?.title,
      track: tags?.track,
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
