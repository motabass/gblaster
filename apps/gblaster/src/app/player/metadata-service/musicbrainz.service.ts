import { Injectable } from '@angular/core';
import luceneEscapeQuery from 'lucene-escape-query';
import { Id3Tags } from './id3-tags.types';
import { RemoteCoverArtUrls } from './metadata.types';
import { CoverArtArchiveApi, MusicBrainzApi } from 'musicbrainz-api';

@Injectable({ providedIn: 'root' })
export class MusicbrainzService {
  private readonly mbApi = new MusicBrainzApi({
    appName: 'gblaster',
    appVersion: '1.0.0',
    appContactInfo: 'markus.mohoritsch@gmx.at'
  });

  private readonly caApi = new CoverArtArchiveApi();

  async getCoverPictureUrls(tags: Id3Tags): Promise<RemoteCoverArtUrls | undefined> {
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

    try {
      const data = await this.mbApi.search('release-group', { query });
      if (!data['release-groups']?.length) {
        return undefined;
      }

      return data['release-groups'][0].id;
    } catch (error) {
      // console.warn('Failed to search release groups:', error);
      return undefined;
    }
  }

  private async fetchCoverArt(releaseGroupId: string): Promise<RemoteCoverArtUrls | undefined> {
    try {
      // const url = `${this.COVER_API_URL}/release-group/${releaseGroupId}`;
      // const coverData = await firstValueFrom(this.http.get<CoverArtResponse>(url));
      const coverData = await this.caApi.getReleaseGroupCovers(releaseGroupId);

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
      const thumb = coverImage.thumbnails['500'] || coverImage.thumbnails.large || coverImage.thumbnails.small || coverImage.image;

      // Use large thumbnail or fall back to the full image
      const original = coverImage.thumbnails.large || coverImage.image;

      return { thumbUrl: thumb, originalUrl: original };
    } catch (error) {
      // console.warn('No cover found with this ID', error);
      return undefined;
    }
  }
}
