import { effect, inject, Injectable } from '@angular/core';
import { AudioService } from '../../player/audio.service';

@Injectable({
  providedIn: 'root'
})
export class MediaSessionService {
  private audioService = inject(AudioService);

  constructor() {
    effect(() => {
      const playing = this.audioService.isPlaying();
      if (playing) {
        this.setPlaybackState('playing');
      } else if (this.audioService.isPaused()) {
        this.setPlaybackState('paused');
      } else {
        this.setPlaybackState('none');
      }
    });

    effect(() => {
      const duration = this.audioService.duration();
      if (this.audioService.isPlaying() && !Number.isNaN(duration)) {
        const currentTime = this.audioService.currentTime();
        this.updateMediaPositionState(duration, currentTime);
      }
    });
  }

  setActionHandler(action: MediaSessionAction, handler: (details: MediaSessionActionDetails) => any) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      console.warn(`The media session action "${action}" is not supported yet.`);
    }
  }

  setSeekToHandler(action: (details: MediaSessionActionDetails) => any) {
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        action(details);
      });
    } catch (error) {
      console.warn(`The media session action "seekto" is not supported yet.`, error);
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
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
  }

  private setPlaybackState(state: MediaSessionPlaybackState) {
    navigator.mediaSession.playbackState = state;
  }
}
