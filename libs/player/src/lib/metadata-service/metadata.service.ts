import { Injectable } from '@angular/core';
import Vibrant from 'node-vibrant/lib/browser.worker';
import { SongMetadata } from '../player.types';
import { ID3TagsService } from './id3-tags.service.abstract';
import { LastfmMetadataService } from './lastfm-metadata.service';

// https://www.npmjs.com/package/id3-writer
// https://github.com/Zazama/node-id3
// https://github.com/borewit/music-metadata
// more web apis? -> FREEDB; MUSICbRAINZ

@Injectable({ providedIn: 'any' })
export class MetadataService {
  private readonly PLACEHOLDER_URL = 'assets/cover-art-placeholder.svg';

  constructor(private id3TagsService: ID3TagsService, private lastfmMetadataService: LastfmMetadataService) {}

  async getMetadata(file: File): Promise<SongMetadata> {
    const tags = await this.id3TagsService.extractTags(file);

    let url = '';
    if (tags?.cover) {
      url = URL.createObjectURL(new Blob([tags.cover], { type: file.type }));
    } else if (tags?.artist || tags?.album) {
      url = await this.lastfmMetadataService.getCoverArtFromLastFM(tags);
    }

    // @ts-ignore
    const vibrant: typeof Vibrant = await import('node-vibrant/lib/browser');
    const palette = url ? await vibrant.from(url).getPalette() : null;

    return {
      coverUrl: url ? url : this.PLACEHOLDER_URL,
      coverColors: palette ? palette : undefined,
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
