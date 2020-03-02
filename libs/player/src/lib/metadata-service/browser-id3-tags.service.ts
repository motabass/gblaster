import { Injectable } from '@angular/core';
import { TagType } from 'jsmediatags/types';
import { ID3TagsService } from './id3-tags.service.abstract';
import { Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'any' })
export class BrowserId3TagsService extends ID3TagsService {
  constructor() {
    super();
  }

  async extractTags(file: File): Promise<Id3Tags | null> {
    const start = performance.now();

    const jsmediatags = await import('jsmediatags');

    let tags: TagType | null = null;
    try {
      tags = await new Promise((resolve, reject) => {
        new jsmediatags.Reader(file).setTagsToRead(['title', 'artist', 'track', 'album', 'year', 'picture']).read({
          onSuccess: resolve,
          onError: reject
        });
      });
    } catch (e) {
      console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden: `, e.info);
    }

    // console.log(metadata?.tags);

    if (!tags) {
      return null;
    }

    let cover: Uint8Array | undefined;

    if (tags.tags?.picture) {
      cover = new Uint8Array(tags.tags.picture.data);
    }
    console.log('Extracting metadata took: ', performance.now() - start);
    return {
      cover: cover,
      artist: tags?.tags?.artist,
      title: tags?.tags?.title,
      track: tags?.tags?.track,
      album: tags?.tags?.album,
      year: tags?.tags?.year
    };
  }
}
