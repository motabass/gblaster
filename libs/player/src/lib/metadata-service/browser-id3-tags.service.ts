import { Injectable } from '@angular/core';
import { TagType } from 'jsmediatags/types';
import { ID3TagsService } from './id3-tags.service.abstract';
import { Id3Tags } from './id3-tags.types';

@Injectable()
export class BrowserId3TagsService extends ID3TagsService {
  constructor() {
    super();
  }

  async extractTags(file: File): Promise<Id3Tags | null> {
    const start = performance.now();

    const JsMediaTags = await import('jsmediatags');

    let metadata: TagType | null = null;
    try {
      metadata = await new Promise((resolve, reject) => {
        new JsMediaTags.Reader(file).setTagsToRead(['title', 'artist', 'track', 'album', 'year', 'picture']).read({
          onSuccess: resolve,
          onError: reject
        });
      });
    } catch (e) {
      console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden: `, e.info);
    }

    // console.log(metadata?.tags);

    if (!metadata) {
      return null;
    }

    let cover: Blob | undefined;

    if (metadata.tags?.picture) {
      cover = new Blob([new Uint8Array(metadata.tags.picture.data)], { type: metadata.tags.picture.format });
    }
    console.log('Extracting metadata took: ', performance.now() - start);
    return {
      cover: cover,
      artist: metadata?.tags?.artist,
      title: metadata?.tags?.title,
      track: metadata?.tags?.track,
      album: metadata?.tags?.album,
      year: metadata?.tags?.year
    };
  }
}
