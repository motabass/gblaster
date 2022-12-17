import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WakelockService {
  wakelock?: WakeLockSentinel;

  constructor() {}

  async activateWakelock() {
    if (!this.wakelock) {
      return this.requestWakeLock();
    }
  }

  private async requestWakeLock() {
    if (navigator.wakeLock) {
      try {
        this.wakelock = await navigator.wakeLock.request('screen');
        this.wakelock.addEventListener('release', () => {});
      } catch (err: any) {
        console.warn(`${err.name}, ${err.message}`);
      }
    }
  }

  async releaseWakelock() {
    if (this.wakelock) {
      return this.wakelock.release();
    }
  }
}
