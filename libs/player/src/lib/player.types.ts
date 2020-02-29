import { SafeUrl } from '@angular/platform-browser';
import { Palette } from 'node-vibrant/lib/color';

export interface Song {
  url: string;
  fileHandle: unknown;
  type: string;
  metadata: SongMetadata;
  playlistPosition?: number;
}

export interface SongMetadata {
  artist?: string;
  title?: string;
  track?: string;
  album?: string;
  year?: string;
  filename: string;
  fileSize: number;
  fileFormat: string;
  duration?: number;
  coverUrl?: string;
  coverSafeUrl?: SafeUrl; // TODO: create this in components when needed not upfront here
  coverColors?: Palette | null;
}

// EQ

export type BandFrequency = 60 | 170 | 310 | 600 | 1000 | 3000 | 6000 | 12000 | 14000 | 16000;
