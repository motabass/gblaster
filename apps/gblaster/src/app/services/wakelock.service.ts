import { Service } from '@angular/core';

/**
Acquires and releases a screen wake lock while playback is active.
*/
@Service()
export class WakelockService {
  #wakelock?: WakeLockSentinel;

  /**
  Requests a screen wake lock when one is not already held.
  */
  async activateWakelock() {
    if (!this.#wakelock) {
      return this.#requestWakeLock();
    }
  }

  /**
  Requests and tracks a screen wake lock if the browser supports the API.
  */
  async #requestWakeLock() {
    if (!navigator.wakeLock) {
      return;
    }

    this.#wakelock = await navigator.wakeLock.request('screen');
    console.log('Wakelock is active');
    this.#wakelock.addEventListener('release', () => {
      console.log('Wakelock was released');
    });
  }

  /**
  Releases the active screen wake lock, if present.
  */
  async releaseWakelock() {
    if (this.#wakelock) {
      return this.#wakelock.release();
    }
  }
}
