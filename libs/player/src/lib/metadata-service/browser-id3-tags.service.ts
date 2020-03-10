import { Injectable } from '@angular/core';
import { IAudioMetadata } from 'music-metadata-browser';
import { ID3TagsService } from './id3-tags.service.abstract';
import { Id3CoverPicture, Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'any' })
export class BrowserId3TagsService extends ID3TagsService {
  constructor() {
    super();
  }

  async extractTags(file: File): Promise<Id3Tags | null> {
    const musicMetadata = await import('music-metadata-browser');

    let tags: IAudioMetadata | undefined;

    const start = performance.now();
    try {
      tags = await musicMetadata.parseBlob(file);
    } catch (e) {
      console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden: `, e.info);
      return null;
    }
    console.log('took: ', performance.now() - start);
    let cover: Id3CoverPicture | undefined;

    if (tags.common.picture) {
      cover = { format: tags.common.picture[0].format, data: tags.common.picture[0].data };
    }
    console.log(tags);
    return {
      picture: cover,
      artist: tags.common.artist,
      title: tags.common.title,
      track: tags.common.track,
      album: tags.common.album,
      year: tags.common.year?.toString()
    };
  }

  // async extractTags(file: File): Promise<Id3Tags | null> {
  //   const jsmediatags = await import('jsmediatags');
  //
  //   let tags: TagType | null = null;
  //
  //   const start = performance.now();
  //   try {
  //     tags = await new Promise((resolve, reject) => {
  //       new jsmediatags.Reader(file).setTagsToRead(['title', 'artist', 'track', 'album', 'year', 'picture']).read({
  //         onSuccess: resolve,
  //         onError: reject
  //       });
  //     });
  //   } catch (e) {
  //     console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden: `, e.info);
  //   }
  //   console.log('took: ', performance.now() - start);
  //   if (!tags) {
  //     return null;
  //   }
  //
  //   let cover: PictureType | undefined;
  //
  //   if (tags.tags?.picture) {
  //     cover = tags.tags.picture;
  //   }
  //   return {
  //     picture: cover?.data && cover.format ? { format: cover.format, data: new Uint8Array(cover.data) } : undefined,
  //     artist: tags?.tags?.artist,
  //     title: tags?.tags?.title,
  //     track: tags?.tags?.track,
  //     album: tags?.tags?.album,
  //     year: tags?.tags?.year
  //   };
  // }
}
