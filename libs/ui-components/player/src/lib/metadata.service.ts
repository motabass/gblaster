import { Injectable } from '@angular/core';
import { parseBlob } from 'music-metadata-browser';
import { SongMetadata } from './player.types';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  constructor() {}

  async extractMetadata(file: File): Promise<SongMetadata> {
    const metadata = await parseBlob(file);

    return {
      cover:
        metadata.common.picture && metadata.common.picture.length
          ? new Blob([metadata.common.picture[0].data], { type: metadata.common.picture[0].format })
          : null,
      artist: metadata.common.artist,
      title: metadata.common.title
    };
  }
}
