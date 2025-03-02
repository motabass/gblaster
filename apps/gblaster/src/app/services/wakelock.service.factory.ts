import { WakelockService } from './wakelock.service';

export function wakelockServiceFactory(): WakelockService | null {
  if (isWakeLockSupported()) {
    console.log('Wakelock support detected');
    return new WakelockService();
  } else {
    console.log('Wakelock support not detected');
    return null;
  }
}

function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}
