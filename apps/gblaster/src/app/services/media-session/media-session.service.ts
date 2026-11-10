import { effect, inject, Service } from '@angular/core';
import { AudioService } from '../../player/audio.service';

/**
Synchronizes audio playback and metadata with the browser Media Session API.
*/
@Service()
export class MediaSessionService {
  #audioService = inject(AudioService);

  /**
  Observes audio state and updates browser playback and position state.
  */
  constructor() {
    effect(() => {
      const playing = this.#audioService.isPlaying();
      if (playing) {
        this.#setPlaybackState('playing');
      } else if (this.#audioService.isPaused()) {
        this.#setPlaybackState('paused');
      } else {
        this.#setPlaybackState('none');
      }
    });

    effect(() => {
      const duration = this.#audioService.duration();
      if (this.#audioService.isPlaying() && !Number.isNaN(duration)) {
        const currentTime = this.#audioService.currentTime();
        this.updateMediaPositionState(duration, currentTime);
      }
    });
  }

  /**
  Registers a handler for a supported browser media-session action.
  */
  setActionHandler(action: MediaSessionAction, handler: (details: MediaSessionActionDetails) => unknown) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      console.warn(`The media session action "${action}" is not supported yet.`);
    }
  }

  /**
  Registers a handler for media-session seek-to requests.
  */
  setSeekToHandler(action: (details: MediaSessionActionDetails) => void) {
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        action(details);
      });
    } catch (error) {
      console.warn(`The media session action "seekto" is not supported yet.`, error);
    }
  }

  /**
  Publishes the current playback duration and position to the browser.
  */
  updateMediaPositionState(duration: number, currentTime: number) {
    if (navigator.mediaSession?.setPositionState) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        position: currentTime
      });
    }
  }

  /**
  Sets the metadata shown by browser and operating-system media controls.
  */
  setBrowserMetadata(metadata: MediaMetadataInit) {
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
  }

  /**
  Sets the playback state exposed through the browser media session.
  */
  #setPlaybackState(state: MediaSessionPlaybackState) {
    navigator.mediaSession.playbackState = state;
  }
}
