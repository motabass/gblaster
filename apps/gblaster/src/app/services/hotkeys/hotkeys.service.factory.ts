import { HotkeysService } from './hotkeys.service';

/**
Creates the hotkeys service only when keyboard support is available.
*/
export function hotkeysServiceFactory(): HotkeysService | null {
  if (isKeyboardSupported()) {
    console.log('Keyboard support detected');
    return new HotkeysService();
  }
  console.log('Keyboard support not detected');
  return null;
}

/**
Returns whether the browser exposes its Keyboard API.
*/
function isKeyboardSupported(): boolean {
  return 'keyboard' in navigator;
}
