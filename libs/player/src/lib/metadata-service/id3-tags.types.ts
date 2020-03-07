export interface Id3Tags {
  picture?: CoverPicture;
  artist?: string;
  title?: string;
  album?: string;
  track?: string;
  year?: string;
}

export interface CoverPicture {
  data: Uint8Array;
  format?: string;
}
