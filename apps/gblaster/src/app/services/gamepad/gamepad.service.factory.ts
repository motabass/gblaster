import { GamepadService } from './gamepad.service';

export function gamepadServiceFactory(): GamepadService | null {
  if (isGamepadSupported()) {
    console.log('Gamepad support detected');
    return new GamepadService();
  }
  console.log('Gamepad support not detected');
  return null;
}

function isGamepadSupported(): boolean {
  return 'getGamepads' in navigator;
}
