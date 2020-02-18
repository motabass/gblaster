import { Injectable } from '@angular/core';
import { Reader } from 'jsmediatags';
import { SongMetadata } from './player.types';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  constructor() {}

  async extractMetadata(file: File): Promise<SongMetadata> {
    const metadata: any = await new Promise((resolve, reject) => {
      new Reader(file).setTagsToRead(['title', 'artist', 'picture']).read({
        onSuccess: resolve,
        onError: reject
      });
    });

    console.log(metadata);

    return {
      cover:
        metadata.tags.picture && metadata.tags.picture.data
          ? new Blob([new Uint8Array(metadata.tags.picture.data)], { type: metadata.tags.picture.format })
          : null,
      artist: metadata.tags.artist,
      title: metadata.tags.title
    };
  }
}
