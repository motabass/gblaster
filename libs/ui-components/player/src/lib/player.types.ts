import { SafeUrl } from '@angular/platform-browser';
import { Howl } from 'howler';

export interface Song {
  sound: Howl;
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

