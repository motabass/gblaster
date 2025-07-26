import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WakelockService {
  private wakelock?: WakeLockSentinel;

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
      } catch (error: any) {
        console.warn(`${error.name}, ${error.message}`);
      }
    }
  }

  async releaseWakelock() {
    if (this.wakelock) {
      return this.wakelock.release();
    }
  }
}
