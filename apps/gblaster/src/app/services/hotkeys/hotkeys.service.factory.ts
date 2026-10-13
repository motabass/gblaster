import { HotkeysService } from './hotkeys.service';

export function hotkeysServiceFactory(): HotkeysService | null {
  if (isKeyboardSupported()) {
    console.log('Keyboard support detected');
    return new HotkeysService();
  }
  console.log('Keyboard support not detected');
  return null;
}

function isKeyboardSupported(): boolean {
  return 'keyboard' in navigator;
}
