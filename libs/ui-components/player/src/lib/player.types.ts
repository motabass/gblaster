import { SafeUrl } from '@angular/platform-browser';

export interface Song {
  howl: Howl;
  name?: string;
  artist?: string;
  album?: string;
  type?: string;
  cover_art_url?: SafeUrl | string;
}

export interface SongMetadata {
  artist: string;
  title: string;
  cover?: Blob;
}
