import { Id3CoverPicture } from './metadata-service/id3-tags.types';
import { CoverColorPalette, RemoteCoverPicture } from './metadata-service/metadata.types';

export interface Song {
  file: File;
  metadata?: SongMetadata;
  playlistPosition?: number;
}

export interface SongMetadata {
  crc: string;
  artist?: string;
  title?: string;
  track?: string;
  album?: string;
  year?: string;
  duration?: number;
  coverUrl?: RemoteCoverPicture;
  embeddedPicture?: Id3CoverPicture;
  coverColors?: CoverColorPalette;
}

// EQ

export type BandFrequency = 60 | 170 | 310 | 600 | 1000 | 3000 | 6000 | 12000 | 14000 | 16000;

export type RepeatMode = 'off' | 'all' | 'one';
