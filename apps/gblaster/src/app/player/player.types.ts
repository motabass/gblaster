import { Id3CoverPicture } from './metadata-service/id3-tags.types';
import { CoverColorPalette, RemoteCoverPicture } from './metadata-service/metadata.types';
import { IFormat } from 'music-metadata';

export interface Track {
  file: File;
  metadata: TrackMetadata;
  playlistPosition?: number;
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

export type FrequencyBand = 60 | 170 | 310 | 600 | 1000 | 3000 | 6000 | 12000 | 14000 | 16000;

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayState {
  state: 'playing' | 'paused' | 'stopped';
  currentTrack?: Track;
}
