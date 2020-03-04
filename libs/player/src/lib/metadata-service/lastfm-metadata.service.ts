import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'any' })
export class LastfmMetadataService {
  private readonly LASTFM_API_KEY = '3a67934408152a2fc3f7216c022ec1df';

  constructor(private http: HttpClient) {}

  async getCoverArtFromLastFM(tags: Id3Tags): Promise<string> {
    const data: any = await this.http
      .get(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${this.LASTFM_API_KEY}&artist=${tags.artist}&album=${tags.album}&format=json`)
      .toPromise();

    if (!data.error && data.album.image[5]['#text']) {
      return data.album.image[5]['#text'];
    }
    return '';
  }
}
