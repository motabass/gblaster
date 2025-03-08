import { MediaSessionService } from './media-session.service';

export function mediaSessionServiceFactory(): MediaSessionService | null {
  if (isMediaSessionSupported()) {
    console.log('Media-Session support detected');
    return new MediaSessionService();
  } else {
    console.log('Media-Session support not detected');
    return null;
  }
}

function isMediaSessionSupported(): boolean {
  return 'mediaSession' in navigator;
}
