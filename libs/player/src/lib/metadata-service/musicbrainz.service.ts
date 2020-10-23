import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// @ts-ignore
import luceneEscapeQuery from 'lucene-escape-query';
import { Id3Tags } from './id3-tags.types';
import { RemoteCoverPicture } from './metadata.types';

@Injectable({ providedIn: 'any' })
export class MusicbrainzService {
  constructor(private http: HttpClient) {}

  async getCoverPicture(tags: Id3Tags): Promise<RemoteCoverPicture | undefined> {
    if (tags.artist && tags.album) {
      let query = `release:${luceneEscapeQuery.escape(tags.album)} AND artist:${luceneEscapeQuery.escape(tags.artist)}`;
      query += tags.track?.of ? ` AND tracks:${tags.track.of}` : '';
      const url = `https://musicbrainz.org/ws/2/release/?query=${query}&limit=10&fmt=json`;
      // TODO: type response
      const data: any = await this.http.get(url).toPromise();

      if (!data.releases.length) {
        return;
      }

      const id = data.releases[0].id;
      // TODO: type response
      let coverData: any;
      try {
        coverData = await this.http.get(`https://coverartarchive.org/release/${id}`).toPromise();
      } catch (e) {
        return;
      }

      const thumbUrl: string = coverData.images[0].thumbnails.small;
      const coverUrl: string = coverData.images[0].image;

      return { thumb: thumbUrl.replace('http://', 'https://'), original: coverUrl.replace('http://', 'https://') };
    }

    return;
  }
}
