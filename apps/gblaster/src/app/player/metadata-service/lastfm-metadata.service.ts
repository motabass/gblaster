import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Id3Tags } from './id3-tags.types';
import { RemoteCoverPicture } from './metadata.types';

@Injectable({ providedIn: 'any' })
export class LastfmMetadataService {
  private readonly LASTFM_API_KEY = '3a67934408152a2fc3f7216c022ec1df';

  constructor(private http: HttpClient) {}

  async getCoverPicture(tags: Id3Tags): Promise<RemoteCoverPicture | undefined> {
    if (tags.artist && tags.album) {
      // TODO: type response
      try {
        const data: any = await firstValueFrom(
          await this.http.get(
            `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${this.LASTFM_API_KEY}&artist=${encodeURIComponent(
              tags.artist
            )}&album=${encodeURIComponent(tags.album)}&format=json`
          )
        );

        if (!data.error && data.album?.image[5]['#text']) {
          return { thumb: data.album.image[0]['#text'], original: data.album.image[5]['#text'] };
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return;
  }
}
