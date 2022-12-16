import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MediaSessionService {
  constructor() {}

  setActionHandler(action: MediaSessionAction, handler: (details: MediaSessionActionDetails) => any) {
    if (navigator.mediaSession) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`The media session action "${action}" is not supported yet.`);
      }
    }
  }

  setSeekToHandler(action: (details: MediaSessionActionDetails) => any) {
    if (navigator.mediaSession) {
      try {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          action(details);
        });
      } catch (error) {
        console.warn(`The media session action "seekto" is not supported yet.`, error);
      }
    }
  }

  updateMediaPositionState(duration: number, currentTime: number) {
    if (navigator.mediaSession?.setPositionState) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        position: currentTime
      });
    }
  }

  setBrowserMetadata(metadata: MediaMetadataInit) {
    if (navigator.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }

  setPlaying() {
    this.setPlaybackState('playing');
  }

  setPaused() {
    this.setPlaybackState('paused');
  }

  private setPlaybackState(state: MediaSessionPlaybackState) {
    if (navigator.mediaSession) {
      navigator.mediaSession.playbackState = state;
    }
  }
}
