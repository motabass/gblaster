import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import luceneEscapeQuery from 'lucene-escape-query';
import { firstValueFrom } from 'rxjs';
import { Id3Tags } from './id3-tags.types';
import { RemoteCoverPicture } from './metadata.types';

@Injectable({ providedIn: 'any' })
export class MusicbrainzService {
  constructor(private http: HttpClient) {}

  async getCoverPicture(tags: Id3Tags): Promise<RemoteCoverPicture | undefined> {
    if (tags.artist && tags.album) {
      const query = `release:${luceneEscapeQuery.escape(tags.album)} AND artist:${luceneEscapeQuery.escape(tags.artist)} AND primarytype:Album`;
      const url = `https://musicbrainz.org/ws/2/release-group?query=${query}&limit=5&fmt=json`;
      // TODO: type response
      try {
        const data: any = await firstValueFrom(this.http.get(url));
        if (!data['release-groups']?.length) {
          return;
        }

        const id = data['release-groups'][0].id;
        // const data2: any = await this.http.get(`https://musicbrainz.org/ws/2/release-group/${id}?fmt=json&inc=releases+artists`).toPromise();
        // // TODO: type response
        //
        // if (!data2['cover-art-archive']?.front) {
        //   console.warn('Kein Cover vorhanden');
        //   return;
        // }
        let coverData: any;
        try {
          coverData = await firstValueFrom(this.http.get(`https://coverartarchive.org/release-group/${id}`));
        } catch (e) {
          console.error('Kein Cover mit der ID gefunden');
          return;
        }

        const coverImage = coverData.images.find((image: any) => image.front === true);
        const thumbUrl: string = coverImage.thumbnails.small;
        const coverUrl: string = coverImage.image;

        return { thumb: thumbUrl.replace('http://', 'https://'), original: coverUrl.replace('http://', 'https://') };
      } catch (err) {
        console.warn('Konnte MusicBrainz nich abfragen', err);
        return;
      }
    }
    return;
  }
}
