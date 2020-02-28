import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Reader } from 'jsmediatags';
import { TagType } from 'jsmediatags/types';

import vibrant from 'node-vibrant';
import { SongMetadata } from './player.types';

// https://www.npmjs.com/package/id3-writer
// https://github.com/Zazama/node-id3
// https://github.com/borewit/music-metadata
// more web apis? -> FREEDB; MUSICbRAINZ

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private readonly LASTFM_API_KEY = '3a67934408152a2fc3f7216c022ec1df';
  private readonly PLACEHOLDER_URL = 'assets/cover-art-placeholder.svg';

  constructor(private domSanitizer: DomSanitizer, private http: HttpClient) {}

  async extractMetadata(file: File): Promise<SongMetadata> {
    let metadata: TagType | null = null;
    try {
      metadata = await new Promise((resolve, reject) => {
        new Reader(file).setTagsToRead(['title', 'artist', 'track', 'album', 'year', 'picture']).read({
          onSuccess: resolve,
          onError: reject
        });
      });
    } catch (e) {
      console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden: `, e.info);
    }

    // console.log(metadata?.tags);

    const picBlob = metadata?.tags?.picture?.data ? new Blob([new Uint8Array(metadata.tags.picture.data)], { type: metadata.tags.picture.format }) : null;

    let url = '';
    if (picBlob) {
      url = URL.createObjectURL(picBlob);
    } else if (metadata?.tags?.artist && metadata.tags.album) {
      url = await this.getCoverArtFromLastFM(metadata.tags.artist, metadata.tags.album);
    }

    const palette = url ? await vibrant.from(url).getPalette() : null;

    return {
      coverSafeUrl: url ? this.domSanitizer.bypassSecurityTrustUrl(url) : this.PLACEHOLDER_URL,
      coverUrl: url ? url : this.PLACEHOLDER_URL,
      coverColors: palette ? palette : null,
      artist: metadata?.tags?.artist,
      title: metadata?.tags?.title,
      track: metadata?.tags?.track,
      album: metadata?.tags?.album,
      year: metadata?.tags?.year,
      filename: file.name,
      fileSize: file.size,
      fileFormat: file.type
    };
  }

  async getCoverArtFromLastFM(artist: string, albumName: string): Promise<string> {
    if (!artist || !albumName) {
      return this.PLACEHOLDER_URL;
    }

    const data: any = await this.http
      .get(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${this.LASTFM_API_KEY}&artist=${artist}&album=${albumName}&format=json`)
      .toPromise();
    return data?.album?.image[5]['#text'];
  }
}
