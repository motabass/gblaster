import { Id3CoverPicture } from './metadata-service/id3-tags.types';
import { CoverColorPalette, RemoteCoverPicture } from './metadata-service/metadata.types';
import { IFormat } from 'music-metadata';

export interface Track {
  file: File;
  fileHandle?: FileSystemFileHandle;
  metadata: TrackMetadata;
}

export interface TrackMetadata {
  hash: string;
  fileName: string;
  artist?: string;
  title?: string;
  track?: string;
  album?: string;
  year?: string;
  format: IFormat;
  coverUrl: RemoteCoverPicture;
  embeddedPicture?: Id3CoverPicture;
  coverColors: CoverColorPalette;
}

export interface IndexedDbTrackMetadata extends TrackMetadata {
  fileHandle?: FileSystemFileHandle;
}

// EQ
export const FREQUENCY_BANDS = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16_000] as const;

// Derive FrequencyBand type from the array
export type FrequencyBand = (typeof FREQUENCY_BANDS)[number];

export type RepeatMode = 'off' | 'all' | 'one';

export interface ColorConfig {
  mainColor?: string;
  peakColor?: string;
}
