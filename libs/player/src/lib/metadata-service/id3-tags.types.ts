export interface Id3Tags {
  picture?: Id3CoverPicture;
  artist?: string;
  title?: string;
  album?: string;
  track?: { no?: number | null; of?: number | null };
  year?: string;
}

export interface Id3CoverPicture {
  data: Uint8Array;
  format?: string;
}
