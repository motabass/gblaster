import { GamepadService } from './gamepad.service';

/**
Creates the gamepad service only when browser gamepad support is available.
*/
export function gamepadServiceFactory(): GamepadService | null {
  if (isGamepadSupported()) {
    console.log('Gamepad support detected');
    return new GamepadService();
  }
  console.log('Gamepad support not detected');
  return null;
}

/**
Returns whether the browser exposes the Gamepad API.
*/
function isGamepadSupported(): boolean {
  return 'getGamepads' in navigator;
}
