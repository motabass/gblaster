import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class LastfmMetadataService {
  private readonly LASTFM_API_KEY = '3a67934408152a2fc3f7216c022ec1df';

  constructor(private http: HttpClient) {}

  async getCoverArtFromLastFM(artist: string, albumName: string): Promise<string> {
    const data: any = await this.http
      .get(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${this.LASTFM_API_KEY}&artist=${artist}&album=${albumName}&format=json`)
      .toPromise();
    return data?.album?.image[5]['#text'];
  }
}
