import { MediaSessionService } from './media-session.service';

export function mediaSessionServiceFactory(): MediaSessionService | null {
  if (isMediaSessionSupported()) {
    console.log('Gamepad support detected');
    return new MediaSessionService();
  } else {
    console.log('Gamepad support not detected');
    return null;
  }
}

function isMediaSessionSupported(): boolean {
  return 'mediaSession' in navigator;
}
