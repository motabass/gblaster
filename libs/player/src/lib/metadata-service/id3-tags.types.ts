import { PictureType } from 'jsmediatags/types';

export interface Id3Tags {
  picture?: PictureType;
  artist?: string;
  title?: string;
  album?: string;
  track?: string;
  year?: string;
}

export interface CoverPicture {
  data: Uint8Array;
  format: string;
}
