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

export interface RemoteCoverArtUrls {
  thumbUrl: string;
  originalUrl: string;
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
