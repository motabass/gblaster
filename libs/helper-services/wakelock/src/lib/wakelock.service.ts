/// <reference types="dom-screen-wake-lock" />

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
    try {
      this.wakelock = await navigator.wakeLock.request('screen');
      this.wakelock.addEventListener('release', () => {});
    } catch (err) {
      console.warn(`${err.name}, ${err.message}`);
    }
  }

  releaseWakelock() {
    if (this.wakelock) {
      this.wakelock.release();
    }
  }
}
