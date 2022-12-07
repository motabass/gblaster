import { crc32 } from '@allex/crc32';
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LocalStorage } from 'ngx-webstorage';
import type Vibrant from 'node-vibrant/lib/browser';
import { firstValueFrom } from 'rxjs';
import { SongMetadata } from '../player.types';
import { Id3TagsService } from './id3-tags.service';
import { LastfmMetadataService } from './lastfm-metadata.service';
import { CoverColorPalette, RemoteCoverPicture } from './metadata.types';
import { MusicbrainzService } from './musicbrainz.service';
import { ThemeService } from '../../theme/theme.service';

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
    const crc = generateFileHash(file);

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

    const tags = await this.id3TagsService.extractTags(file);
    if (!tags) {
      // if no tags
      return { crc: crc };
    }

    let coverUrl: RemoteCoverPicture | undefined;

    if (this.useWebMetainfos) {
      if (tags.artist && tags.album) {
        coverUrl = await this.lastfmMetadataService.getCoverPicture(tags);
        if (!coverUrl) {
          coverUrl = await this.musicbrainzService.getCoverPicture(tags);
        }
      } else {
        console.warn('Missing tags for lookup');
      }
    }

    const palette = coverUrl ? await extractColors(coverUrl.original) : undefined;

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

async function extractColors(url: string): Promise<CoverColorPalette> {
  // @ts-ignore
  const vibrant: typeof Vibrant = await import('node-vibrant/lib/browser');
  // @ts-ignore
  const palette = await vibrant.default.from(url).getPalette();

  return {
    vibrant: { hex: palette.Vibrant?.hex, textHex: palette.Vibrant?.titleTextColor },
    darkVibrant: { hex: palette.DarkVibrant?.hex, textHex: palette.DarkVibrant?.titleTextColor },
    lightVibrant: { hex: palette.LightVibrant?.hex, textHex: palette.LightVibrant?.titleTextColor },
    muted: { hex: palette.Muted?.hex, textHex: palette.Muted?.titleTextColor },
    darkMuted: { hex: palette.DarkMuted?.hex, textHex: palette.DarkMuted?.titleTextColor },
    lightMuted: { hex: palette.LightMuted?.hex, textHex: palette.LightMuted?.titleTextColor }
  };
}
