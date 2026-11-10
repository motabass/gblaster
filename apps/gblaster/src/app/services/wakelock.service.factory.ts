import { WakelockService } from './wakelock.service';

/**
Creates the wake-lock service only when the browser exposes the API.
*/
export function wakelockServiceFactory(): WakelockService | null {
  if (isWakeLockSupported()) {
    console.log('Wakelock support detected');
    return new WakelockService();
  }
  console.log('Wakelock support not detected');
  return null;
}

/**
Returns whether the browser supports the Screen Wake Lock API.
*/
function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}
