import { SafeUrl } from '@angular/platform-browser';

export interface Song {
  url: string;
  fileHandle: unknown;
  type?: string;
  metadata: SongMetadata;
  playlistPosition?: number;
}

export interface SongMetadata {
  artist: string;
  title: string;
  track?: number;
  album?: string;
  year?: number;
  filename: string;
  fileSize: number;
  fileFormat: string;
  duration?: number;
  coverUrl?: string;
  coverSafeUrl?: SafeUrl | string;
}
