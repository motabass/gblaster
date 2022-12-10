import { crc32 } from '@allex/crc32';
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LocalStorage } from 'ngx-webstorage';
import { firstValueFrom } from 'rxjs';
import { SongMetadata } from '../player.types';
import { Id3TagsService } from './id3-tags.service';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { CoverColorPalette, RemoteCoverPicture } from './metadata.types';
import { MusicbrainzService } from './musicbrainz.service';
import { ThemeService } from '../../theme/theme.service';
import { TinyColor } from '@thebespokepixel/es-tinycolor';
import { get_palette_from_byte_array } from 'vibrant-wasm';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly PLACEHOLDER_URL = 'assets/icons/record.svg';

  @LocalStorage('useWebMetainfos', true) useWebMetainfos!: boolean;
  @LocalStorage('useTagsCache', true) useTagsCache!: boolean;
  @LocalStorage('useTagEmbeddedPicture', true) useTagEmbeddedPicture!: boolean;
  @LocalStorage('preferTagEmbeddedPicture', true) preferTagEmbeddedPicture!: boolean;

  constructor(
    private id3TagsService: Id3TagsService,
    private lastfmMetadataService: LastfmMetadataService,
    private musicbrainzService: MusicbrainzService,
    private indexedDBService: NgxIndexedDBService,
    private themeService: ThemeService
  ) {}

  async getMetadata(file: File): Promise<SongMetadata> {
    console.time('hash');
    const crc = generateFileHash(file);
    console.timeEnd('hash');
    if (this.useTagsCache) {
      const metadataCache: SongMetadata = await firstValueFrom(this.indexedDBService.getByKey<SongMetadata>('metatags', crc));

      if (metadataCache) {
        if (metadataCache.embeddedPicture && this.useTagEmbeddedPicture && (!metadataCache.coverUrl || this.preferTagEmbeddedPicture)) {
          // renew local object urls
          const url = URL.createObjectURL(new Blob([metadataCache.embeddedPicture.data], { type: metadataCache.embeddedPicture.format }));
          return {
            ...metadataCache,
            coverUrl: { thumb: url, original: url } // overwrite remote url with objectUrl for tag cover art
          };
        } else {
          return this.metadataPrepareForUse(metadataCache);
        }
      }
    }
    console.time('id3tags');
    const tags = await this.id3TagsService.extractTags(file);
    console.timeEnd('id3tags');
    if (!tags) {
      // if no tags
      return { crc: crc };
    }

    let coverUrl: RemoteCoverPicture | undefined;

    if (this.useWebMetainfos) {
      if (tags.artist && tags.album) {
        console.time('webcover');
        coverUrl = await this.lastfmMetadataService.getCoverPicture(tags);
        if (!coverUrl) {
          coverUrl = await this.musicbrainzService.getCoverPicture(tags);
        }
        console.timeEnd('webcover');
      } else {
        console.warn('Missing tags for lookup');
      }
    }

    let palette: CoverColorPalette | undefined;
    if (coverUrl) {
      console.time('vibrant');
      palette = await extractColorsWithNodeVibrant(coverUrl.original);
      console.timeEnd('vibrant');
      // console.time('wasm');
      // palette = await extractColorsWithVibrantWasm(coverUrl.original);
      // console.timeEnd('wasm');
    }

    const metadata: SongMetadata = {
      crc: crc,
      coverUrl: coverUrl ? coverUrl : { thumb: this.PLACEHOLDER_URL, original: this.PLACEHOLDER_URL },
      embeddedPicture: tags.picture,
      coverColors: palette,
      artist: tags?.artist,
      title: tags?.title,
      track: tags?.track?.no?.toString(),
      album: tags?.album,
      year: tags?.year,
      format: tags?.format
    };

    if (this.useTagsCache) {
      await this.indexedDBService.add('metatags', metadata).toPromise();
    }
    return this.metadataPrepareForUse(metadata);
  }

  private metadataPrepareForUse(meta: SongMetadata): SongMetadata {
    if (meta.embeddedPicture && this.useTagEmbeddedPicture && (!meta.coverUrl || this.preferTagEmbeddedPicture)) {
      // renew local object urls
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

function generateFileHash(file: File): string {
  const hashString: string = file.name + file.type + file.size + file.lastModified;
  return crc32(hashString, 'hex') as string;
}

async function extractColorsWithNodeVibrant(url: string): Promise<CoverColorPalette> {
  const vibrantLib = await import('node-vibrant/lib/browser');
  const vibrant = vibrantLib.default;
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
async function extractColorsWithVibrantWasm(url: string): Promise<CoverColorPalette | undefined> {
  const imageArrayBuffer = await urlToArrayBuffer(url);
  if (imageArrayBuffer) {
    const palette = await get_palette_from_byte_array(new Uint8Array(imageArrayBuffer));
    //  TODO convert to hex in wasm or use rgb values
    return {
      vibrant: { hex: '#' + new TinyColor({ r: palette.primary[0], g: palette.primary[1], b: palette.primary[2] }).toHex(false) },
      darkVibrant: { hex: '#' + new TinyColor({ r: palette.dark[0], g: palette.dark[1], b: palette.dark[2] }).toHex(false) },
      lightVibrant: { hex: '#' + new TinyColor({ r: palette.light[0], g: palette.light[1], b: palette.light[2] }).toHex(false) },
      muted: { hex: '#' + new TinyColor({ r: palette.muted[0], g: palette.muted[1], b: palette.muted[2] }).toHex(false) },
      darkMuted: { hex: '#' + new TinyColor({ r: palette.dark_muted[0], g: palette.dark_muted[1], b: palette.dark_muted[2] }).toHex(false) },
      lightMuted: { hex: '#' + new TinyColor({ r: palette.light_muted[0], g: palette.light_muted[1], b: palette.light_muted[2] }).toHex(false) }
    };
  }
}

async function urlToArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  const blob = await response.blob();
  return await blob.arrayBuffer();
}
