import { Injectable } from '@angular/core';

enum Buttons {
  A_BUTTON = 0
}

@Injectable({
  providedIn: 'root'
})
export class GamepadService {
  interval?: number;

  constructor() {
    addEventListener('gamepadconnected', (e: any) => {
      const gamepads = navigator.getGamepads();
      for (const gamepad of gamepads) {
        if (gamepad) {
          console.log('Gamepad connected: ');
          console.log(gamepad);
        }
      }

      this.interval = window.setInterval(() => {
        const gps = navigator.getGamepads();
        const firstGamepad = gps[0];

        // console.log('GAMEPAD-STATE: ', firstGamepad);

        if (firstGamepad?.buttons[Buttons.A_BUTTON].pressed) {
          this.aButtonPressed();
        }
      }, 16);
    });

    addEventListener('gamepaddisconnected', (e: any) => {
      if (navigator.getGamepads()[0] === null) {
        clearInterval(this.interval);
      }
    });
  }

  aButtonPressed() {
    console.log('A pressed');
  }
}
