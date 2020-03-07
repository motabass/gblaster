import { Injectable } from '@angular/core';
import { PictureType, TagType } from 'jsmediatags/types';
import { ID3TagsService } from './id3-tags.service.abstract';
import { Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'any' })
export class BrowserId3TagsService extends ID3TagsService {
  constructor() {
    super();
  }

  async extractTags(file: File): Promise<Id3Tags | null> {
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

    if (!tags) {
      return null;
    }

    let cover: PictureType | undefined;

    if (tags.tags?.picture) {
      cover = tags.tags.picture;
    }
    return {
      picture: cover?.data && cover.format ? { format: cover.format, data: new Uint8Array(cover.data) } : undefined,
      artist: tags?.tags?.artist,
      title: tags?.tags?.title,
      track: tags?.tags?.track,
      album: tags?.tags?.album,
      year: tags?.tags?.year
    };
  }

  // async extractTags(file: File): Promise<Id3Tags | null> {
  //   const musicMetadata = await import('music-metadata-browser');
  //
  //   const tags: IAudioMetadata = await musicMetadata.parseBlob(file);
  //
  //   console.log(tags);
  //   return {
  //     // picture: cover,
  //     artist: tags?.common.artist,
  //     title: tags?.common.title,
  //     track: tags?.common.track?.no.toString(),
  //     album: tags?.common.album,
  //     year: tags?.common.year?.toString()
  //   };
  // }
}
