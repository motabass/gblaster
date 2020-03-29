import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WakelockService {
  wakelock: any;

  constructor() {}

  async activateWakelock() {
    if (!this.wakelock) {
      return this.requestWakeLock();
    }
  }

  private async requestWakeLock() {
    try {
      // @ts-ignore
      this.wakelock = await navigator.wakeLock.request('screen');
      this.wakelock.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
      console.log('Wake Lock is active');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }

  releaseWakelock() {
    if (this.wakelock) {
      this.wakelock.release();
    }
  }
}
