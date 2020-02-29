import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import Vibrant from 'node-vibrant/lib/browser.worker';
import { SongMetadata } from '../player.types';
import { ID3TagsService } from './id3-tags.service.abstract';
import { LastfmMetadataService } from './lastfm-metadata.service';

// https://www.npmjs.com/package/id3-writer
// https://github.com/Zazama/node-id3
// https://github.com/borewit/music-metadata
// more web apis? -> FREEDB; MUSICbRAINZ

@Injectable()
export class MetadataService {
  private readonly PLACEHOLDER_URL = 'assets/cover-art-placeholder.svg';

  constructor(private id3TagsService: ID3TagsService, private lastfmMetadataService: LastfmMetadataService, private domSanitizer: DomSanitizer) {}

  async getMetadata(file: File): Promise<SongMetadata> {
    const tags = await this.id3TagsService.extractTags(file);

    let url = '';
    if (tags?.cover) {
      url = URL.createObjectURL(tags.cover);
    } else if (tags?.artist && tags.album) {
      url = await this.lastfmMetadataService.getCoverArtFromLastFM(tags.artist, tags.album);
    }

    // @ts-ignore
    const vibrant: typeof Vibrant = await import('node-vibrant/lib/browser');

    const palette = url ? await vibrant.from(url).getPalette() : null;

    return {
      coverSafeUrl: url ? this.domSanitizer.bypassSecurityTrustUrl(url) : this.PLACEHOLDER_URL,
      coverUrl: url ? url : this.PLACEHOLDER_URL,
      coverColors: palette ? palette : null,
      artist: tags?.artist,
      title: tags?.title,
      track: tags?.track,
      album: tags?.album,
      year: tags?.year,
      filename: file.name,
      fileSize: file.size,
      fileFormat: file.type
    };
  }
}
