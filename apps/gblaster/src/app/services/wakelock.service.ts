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
      this.wakelock = await navigator.wakeLock.request('screen');
      console.log('Wakelock is active');
      this.wakelock.addEventListener('release', () => {
        console.log('Wakelock was released');
      });
    }
  }

  async releaseWakelock() {
    if (this.wakelock) {
      return this.wakelock.release();
    }
  }
}
