import { Id3Tags } from './id3-tags.types';

export interface CoverColorPalette {
  vibrant?: CoverColor;
  muted?: CoverColor;
  darkVibrant?: CoverColor;
  darkMuted?: CoverColor;
  lightVibrant?: CoverColor;
  lightMuted?: CoverColor;
}

export interface CoverColor {
  hex?: string;
  textHex?: string;
}

export interface RemoteCoverPicture {
  thumb: string;
  original: string;
}

export interface TagsWorkerRequest {
  id: string;
  file: File;
}

export interface TagsWorkerResponse {
  id: string;
  tags?: Id3Tags;
  error?: string;
}
