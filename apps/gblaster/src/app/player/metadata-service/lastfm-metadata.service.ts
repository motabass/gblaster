import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Id3Tags } from './id3-tags.types';
import { RemoteCoverPicture } from './metadata.types';
import { ensureHttps } from './metadata.helper';

interface LastfmImage {
  '#text': string;
  size: string;
}

interface LastfmAlbum {
  name: string;
  artist: string;
  image: LastfmImage[];
}

interface LastfmSuccessResponse {
  album: LastfmAlbum;
}

interface LastfmErrorResponse {
  error: number;
  message: string;
}

type LastfmResponse = LastfmSuccessResponse | LastfmErrorResponse;

@Injectable({ providedIn: 'root' })
export class LastfmMetadataService {
  private http = inject(HttpClient);
  private readonly LASTFM_API_KEY = '3a67934408152a2fc3f7216c022ec1df';
  private readonly API_URL = 'https://ws.audioscrobbler.com/2.0/';

  async getCoverPicture(tags: Id3Tags): Promise<RemoteCoverPicture | undefined> {
    if (!tags.artist || !tags.album) {
      return undefined;
    }

    try {
      const data = await this.fetchAlbumInfo(tags.artist, tags.album);
      return this.extractCoverUrls(data);
    } catch (error) {
      console.warn('Failed to query Last.fm', error);
      return undefined;
    }
  }

  private async fetchAlbumInfo(artist: string, album: string): Promise<LastfmResponse> {
    const url = this.buildApiUrl('album.getinfo', {
      artist: encodeURIComponent(artist),
      album: encodeURIComponent(album)
    });

    return firstValueFrom(this.http.get<LastfmResponse>(url));
  }

  private buildApiUrl(method: string, params: Record<string, string>): string {
    const queryParams = new URLSearchParams({
      method,
      api_key: this.LASTFM_API_KEY,
      format: 'json',
      ...params
    });

    return `${this.API_URL}?${queryParams.toString()}`;
  }

  private extractCoverUrls(data: LastfmResponse): RemoteCoverPicture | undefined {
    if ('error' in data || !('album' in data)) {
      return undefined;
    }

    const images = data.album.image;
    if (!images || !images[5]?.['#text']) {
      return undefined;
    }

    return {
      thumb: ensureHttps(images[1]['#text']),
      original: ensureHttps(images[5]['#text'])
    };
  }
}
