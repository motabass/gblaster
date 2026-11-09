import { Service } from '@angular/core';

@Service()
export class WakelockService {
  #wakelock?: WakeLockSentinel;

  async activateWakelock() {
    if (!this.#wakelock) {
      return this.#requestWakeLock();
    }
  }

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

  async releaseWakelock() {
    if (this.#wakelock) {
      return this.#wakelock.release();
    }
  }
}
