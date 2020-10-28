/// <reference types="wicg-mediasession" />

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

  setSeekMediaElement(mediaElement: HTMLMediaElement) {
    if (navigator.mediaSession) {
      try {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.fastSeek && 'fastSeek' in mediaElement) {
            mediaElement.fastSeek(details.seekTime);
          } else {
            mediaElement.currentTime = details.seekTime;
          }
        });
      } catch (error) {
        console.warn(`The media session action "seekto" is not supported yet.`);
      }
    }
  }

   updateMediaPositionState(mediaElement: HTMLMediaElement) {
    if (navigator.mediaSession?.setPositionState) {
      navigator.mediaSession.setPositionState({
        duration: mediaElement.duration,
        position: mediaElement.currentTime
      });
    }
  }

  setBrowserMetadata(metadata: MediaMetadataInit) {
    if (navigator.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }

  setPlaying() {
    // this.setPlaybackState('playing');
  }

  setPaused() {
    // this.setPlaybackState('paused');
  }

  private setPlaybackState(state: MediaSessionPlaybackState) {
    if (navigator.mediaSession) {
      navigator.mediaSession.playbackState = state;
    }
  }
}
