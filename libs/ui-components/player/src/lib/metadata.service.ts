import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Reader } from 'jsmediatags';
import { SongMetadata } from './player.types';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  constructor(private domSanitizer: DomSanitizer) {}

  async extractMetadata(file: File): Promise<SongMetadata> {
    const metadata: any = await new Promise((resolve, reject) => {
      new Reader(file)
        // .setTagsToRead(['title', 'artist', 'picture'])
        .read({
          onSuccess: resolve,
          onError: reject
        });
    });

    // console.log(metadata);

    const picBlob =
      metadata.tags.picture && metadata.tags.picture.data
        ? new Blob([new Uint8Array(metadata.tags.picture.data)], { type: metadata.tags.picture.format })
        : null;

    return {
      coverSafeUrl: picBlob ? this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picBlob)) : 'assets/cover-art-placeholder.svg',
      coverUrl: picBlob ? URL.createObjectURL(picBlob) : 'assets/cover-art-placeholder.svg',
      artist: metadata.tags.artist,
      title: metadata.tags.title,
      track: metadata.tags.track,
      album: metadata.tags.album,
      year: metadata.tags.year,
      filename: file.name,
      fileSize: file.size,
      fileFormat: file.type
    };
  }
}
