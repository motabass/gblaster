import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import luceneEscapeQuery from 'lucene-escape-query';
import { firstValueFrom } from 'rxjs';
import { Id3Tags } from './id3-tags.types';
import { RemoteCoverPicture } from './metadata.types';
import { ensureHttps } from './metadata.helper';

interface MusicbrainzReleaseGroup {
  id: string;
  title: string;
  'first-release-date'?: string;
}

interface MusicbrainzResponse {
  'release-groups': MusicbrainzReleaseGroup[];
  count: number;
}

interface CoverArtImage {
  image: string;
  front: boolean;
  thumbnails: {
    '500': string;
    large: string;
    small: string;
  };
}

interface CoverArtResponse {
  images: CoverArtImage[];
}

@Injectable({ providedIn: 'root' })
export class MusicbrainzService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://musicbrainz.org/ws/2';
  private readonly COVER_API_URL = 'https://coverartarchive.org';

  async getCoverPictureUrls(tags: Id3Tags): Promise<RemoteCoverPicture | undefined> {
    if (!tags.artist || !tags.album) {
      return undefined;
    }

    try {
      const releaseGroupId = await this.findReleaseGroupId(tags.artist, tags.album);
      if (!releaseGroupId) {
        return undefined;
      }

      return await this.fetchCoverArt(releaseGroupId);
    } catch (error) {
      // console.warn('Failed to query MusicBrainz', error);
      return undefined;
    }
  }

  private async findReleaseGroupId(artist: string, album: string): Promise<string | undefined> {
    const query = `release:${luceneEscapeQuery.escape(album)} AND artist:${luceneEscapeQuery.escape(artist)} AND primarytype:Album`;
    const url = `${this.API_URL}/release-group?query=${query}&limit=5&fmt=json`;

    try {
      const data = await firstValueFrom(this.http.get<MusicbrainzResponse>(url));

      if (!data['release-groups']?.length) {
        return undefined;
      }

      return data['release-groups'][0].id;
    } catch (error) {
      // console.warn('Failed to search release groups:', error);
      return undefined;
    }
  }

  private async fetchCoverArt(releaseGroupId: string): Promise<RemoteCoverPicture | undefined> {
    try {
      const url = `${this.COVER_API_URL}/release-group/${releaseGroupId}`;
      const coverData = await firstValueFrom(this.http.get<CoverArtResponse>(url));

      if (!coverData.images?.length) {
        return undefined;
      }

      // First try to find a front cover
      let coverImage = coverData.images.find((image) => image.front);

      // If no front cover is available, use any image
      if (!coverImage && coverData.images.length > 0) {
        coverImage = coverData.images[0];
      }

      if (!coverImage) {
        return undefined;
      }

      // Create a fallback chain for thumbnails
      const thumb = ensureHttps(coverImage.thumbnails['500'] || coverImage.thumbnails.large || coverImage.thumbnails.small || coverImage.image);

      // Use large thumbnail or fall back to the full image
      const original = ensureHttps(coverImage.thumbnails.large || coverImage.image);

      return { thumb, original };
    } catch (error) {
      // console.warn('No cover found with this ID', error);
      return undefined;
    }
  }
}
