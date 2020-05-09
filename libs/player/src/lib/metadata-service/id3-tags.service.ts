import { Injectable } from '@angular/core';
import { IAudioMetadata } from 'music-metadata-browser';
import { Id3CoverPicture, Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'any' })
export class Id3TagsService {
  async extractTags(file: File): Promise<Id3Tags | null> {
    const musicMetadata = await import('music-metadata-browser');

    let tags: IAudioMetadata | undefined;
    try {
      tags = await musicMetadata.parseBlob(file, { duration: false, includeChapters: false, skipPostHeaders: false, skipCovers: false });
    } catch (e) {
      console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden: `, e);
      return null;
    }
    let cover: Id3CoverPicture | undefined;

    if (tags.common.picture) {
      cover = { format: tags.common.picture[0].format, data: tags.common.picture[0].data };
    }
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
  //   let cover: Id3CoverPicture | undefined;
  //
  //   if (tags.tags?.picture) {
  //     cover =
  //       tags.tags?.picture.data && tags.tags?.picture.format ? { format: tags.tags?.picture.format, data: new Uint8Array(tags.tags?.picture.data) } : undefined;
  //   }
  //   return {
  //     picture: cover,
  //     artist: tags?.tags?.artist,
  //     title: tags?.tags?.title,
  //     track: { no: tags?.tags?.track ? parseInt(tags?.tags?.track, 10) : undefined, of: undefined },
  //     album: tags?.tags?.album,
  //     year: tags?.tags?.year
  //   };
  // }
}
