import { RemoteCoverArtUrls } from '../metadata-service/metadata.types';

export interface Album {
  name: string;
  year: string;
  coverUrl: RemoteCoverArtUrls;
}
