import { MediaSessionService } from './media-session.service';

/**
Creates the media-session service only when the browser supports the API.
*/
export function mediaSessionServiceFactory(): MediaSessionService | null {
  if (isMediaSessionSupported()) {
    console.log('Media-Session support detected');
    return new MediaSessionService();
  }
  console.log('Media-Session support not detected');
  return null;
}

/**
Returns whether the browser exposes the Media Session API.
*/
function isMediaSessionSupported(): boolean {
  return 'mediaSession' in navigator;
}
