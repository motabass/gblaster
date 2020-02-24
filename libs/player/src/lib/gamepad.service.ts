import { Injectable, OnDestroy } from '@angular/core';
import { GamepadButtonAction, GamepadButtons } from './gamepad.types';

@Injectable({
  providedIn: 'root'
})
export class GamepadService implements OnDestroy {
  intervals: number[] = [];

  actions: GamepadButtonAction[] = [];

  pressedButtonsCaches: number[][] = [];

  constructor() {
    for (const buttonIndex in GamepadButtons) {
      if (Number(buttonIndex) >= 0) {
        this.actions.push(notAssigned);
      }
    }

    addEventListener('gamepadconnected', (event: any) => this.connectionListener(event));

    addEventListener('gamepaddisconnected', (event: any) => this.disconnectionListener(event));
  }

  private connectionListener(event: any) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[event.gamepad.index];
    console.log(`New gamepad with Number ${event.gamepad.index} connected: `);
    console.log(gamepad);

    this.intervals[event.gamepad.index] = window.setInterval(() => {
      const gps = navigator.getGamepads();
      const gp = gps[event.gamepad.index];

      if (!gp) {
        return;
      }

      for (const buttonIndex in GamepadButtons) {
        if (Number(buttonIndex) >= 0) {
          this.checkForButtonClicked(gp, Number(buttonIndex));
        }
      }
    }, 16);
  }

  private disconnectionListener(event: any) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[event.gamepad.index];
    console.log(`Gamepad ${event.gamepad.index} disconnected!`);
    if (gamepad === null) {
      clearInterval(this.intervals[event.gamepad.index]);
    }
  }

  private fireAction(index: number, value: number) {
    this.actions[index](value);
  }

  registerAction(buttonIndex: number, action: GamepadButtonAction) {
    this.actions[buttonIndex] = action;
  }

  private checkForButtonClicked(gamepad: Gamepad, buttonIndex: number) {
    const button = gamepad.buttons[buttonIndex];
    if (!button) {
      return;
    }

    if (!this.pressedButtonsCaches[gamepad.index]) {
      this.pressedButtonsCaches[gamepad.index] = [];
    }

    let cache = this.pressedButtonsCaches[gamepad.index];
    if (button.pressed) {
      if (!cache.includes(buttonIndex)) {
        cache.push(buttonIndex);
        this.fireAction(buttonIndex, button.value);
      }
    } else {
      if (cache.includes(buttonIndex)) {
        cache = cache.filter((b) => b !== buttonIndex);
      }
    }

    this.pressedButtonsCaches[gamepad.index] = cache;
  }

  ngOnDestroy(): void {
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
  }
}

function notAssigned() {
  console.log('Button nicht zugewiesen');
}
