import { Id3CoverPicture } from './metadata-service/id3-tags.types';
import { CoverColorPalette, RemoteCoverPicture } from './metadata-service/metadata.types';
import { IFormat } from 'music-metadata';

export interface Track {
  file: File;
  metadata: TrackMetadata;
}

export interface TrackMetadata {
  crc: string;
  artist?: string;
  title?: string;
  track?: string;
  album?: string;
  year?: string;
  duration?: number;
  format?: IFormat;
  coverUrl?: RemoteCoverPicture;
  embeddedPicture?: Id3CoverPicture;
  coverColors?: CoverColorPalette;
}

// EQ

export type FrequencyBand = 60 | 170 | 310 | 600 | 1000 | 3000 | 6000 | 12_000 | 14_000 | 16_000;

export type RepeatMode = 'off' | 'all' | 'one';

export interface ColorConfig {
  mainColor?: string;
  peakColor?: string;
}
