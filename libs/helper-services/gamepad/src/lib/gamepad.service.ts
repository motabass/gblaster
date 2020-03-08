import { Injectable, OnDestroy } from '@angular/core';
import { ActionCache, ActionFunction, GamepadAction, GamepadAxes, GamepadButtons, InputCheckMode } from './gamepad.types';

@Injectable({
  providedIn: 'root'
})
export class GamepadService implements OnDestroy {
  private readonly DEFAULT_TURBO_TIMEOUT = 300;
  private readonly DEFAULT_DEADSPACE = 0.07;

  private checkIntervals: number[] = [];
  private pressedButtonsCaches: ActionCache[][] = [];
  private activeAxesCaches: ActionCache[][] = [];

  buttonActions: GamepadAction[] = [];
  axesActions: GamepadAction[] = [];

  constructor() {
    for (const buttonIndex in GamepadButtons) {
      if (Number(buttonIndex) >= 0) {
        this.buttonActions.push(this.createDefaultButtonAction(Number(buttonIndex)));
      }
    }
    for (const axisIndex in GamepadAxes) {
      if (Number(axisIndex) >= 0) {
        this.axesActions.push(this.createDefaultAxisAction(Number(axisIndex)));
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

    this.checkIntervals[event.gamepad.index] = window.setInterval(() => {
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

      for (const axisIndex in GamepadAxes) {
        if (Number(axisIndex) >= 0) {
          this.checkForAxesInput(gp, Number(axisIndex));
        }
      }
    }, 16);
  }

  private createDefaultButtonAction(buttonIndex: number): GamepadAction {
    return {
      action: () => console.log('Button nicht zugewiesen'),
      mode: 'hold',
      index: buttonIndex,
      timeout: this.DEFAULT_TURBO_TIMEOUT,
      default: true
    };
  }

  private createDefaultAxisAction(axisIndex: number): GamepadAction {
    return {
      action: () => console.log('Achse nicht zugewiesen'),
      mode: 'hold',
      index: axisIndex,
      timeout: this.DEFAULT_TURBO_TIMEOUT,
      default: true
    };
  }

  private disconnectionListener(event: any) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[event.gamepad.index];
    console.log(`Gamepad ${event.gamepad.index} disconnected!`);
    if (gamepad === null) {
      clearInterval(this.checkIntervals[event.gamepad.index]);
    }
  }

  private fireButtonAction(index: number, value: number) {
    console.log(`Button ${index} sending value: ${value}`);
    this.buttonActions[index].action(value);
  }

  private fireAxisAction(index: number, value: number) {
    console.log(`Axis ${index} sending value: ${value}`);
    this.axesActions[index].action(value);
  }

  registerButtonAction(buttonIndex: number, actionFunction: ActionFunction, mode: InputCheckMode = 'click', timeout = this.DEFAULT_TURBO_TIMEOUT) {
    if (!this.buttonActions[buttonIndex].default) {
      console.warn('Diesem Button wurde bereits eine Action zugewiesen.');
    }

    this.buttonActions[buttonIndex] = {
      action: actionFunction,
      mode: mode,
      timeout: timeout,
      index: buttonIndex
    };
  }

  deregisterButtonAction(buttonIndex: number) {
    this.buttonActions[buttonIndex] = this.createDefaultButtonAction(buttonIndex);
  }

  registerAxisAction(axisIndex: number, actionFunction: ActionFunction, mode: InputCheckMode = 'click', turboTimeout = this.DEFAULT_TURBO_TIMEOUT) {
    if (!this.axesActions[axisIndex].default) {
      console.warn('Dieser Achse wurde bereits eine Action zugewiesen.');
    }

    this.axesActions[axisIndex] = {
      action: actionFunction,
      mode: mode,
      timeout: turboTimeout,
      index: axisIndex
    };
  }

  deregisterAxisAction(axisIndex: number) {
    this.axesActions[axisIndex] = this.createDefaultAxisAction(axisIndex);
  }

  private checkForButtonClicked(gamepad: Gamepad, buttonIndex: number) {
    const button = gamepad.buttons[buttonIndex];
    if (!button) {
      return;
    }

    if (this.buttonActions[buttonIndex].mode === 'hold' && button.pressed) {
      this.fireButtonAction(buttonIndex, button.value);
      return;
    }

    if (!this.pressedButtonsCaches[gamepad.index]) {
      this.pressedButtonsCaches[gamepad.index] = [];
    }

    let cache = this.pressedButtonsCaches[gamepad.index];
    const buttonCache = cache.find((ac) => ac.index === buttonIndex);
    if (button.pressed) {
      if (!buttonCache) {
        cache.push({ index: buttonIndex, lastActionExecution: performance.now() });
        this.fireButtonAction(buttonIndex, button.value);
      } else {
        const timeout = this.buttonActions[buttonIndex].timeout ?? this.DEFAULT_TURBO_TIMEOUT;
        if (this.buttonActions[buttonIndex].mode === 'turbo' && performance.now() - buttonCache.lastActionExecution > timeout) {
          buttonCache.lastActionExecution = performance.now();
          this.fireButtonAction(buttonIndex, button.value);
        }
      }
    } else {
      if (buttonCache) {
        cache = cache.filter((ac) => ac.index !== buttonIndex);
      }
    }

    this.pressedButtonsCaches[gamepad.index] = cache;
  }

  private isAxisValueInDetectionRange(axis: number): boolean {
    return axis.valueOf() > this.DEFAULT_DEADSPACE || axis.valueOf() < 0 - this.DEFAULT_DEADSPACE;
  }

  private checkForAxesInput(gamepad: Gamepad, axisIndex: number) {
    const axis = gamepad.axes[axisIndex];
    if (!axis) {
      return;
    }

    // TODO: option for log and fixed

    if (this.axesActions[axisIndex].mode === 'hold' && this.isAxisValueInDetectionRange(axis)) {
      this.fireAxisAction(axisIndex, axis.valueOf());
      return;
    }

    // TODO: move init to connect
    if (!this.activeAxesCaches[gamepad.index]) {
      this.activeAxesCaches[gamepad.index] = [];
    }

    let cache = this.activeAxesCaches[gamepad.index];
    const axisCache = cache.find((ac) => ac.index === axisIndex);
    if (this.isAxisValueInDetectionRange(axis)) {
      if (!axisCache) {
        cache.push({ index: axisIndex, lastActionExecution: performance.now() });
        this.fireAxisAction(axisIndex, axis.valueOf());
      } else {
        const timeout = this.axesActions[axisIndex].timeout ?? this.DEFAULT_TURBO_TIMEOUT;
        if (this.axesActions[axisIndex].mode === 'turbo' && performance.now() - axisCache.lastActionExecution > timeout) {
          axisCache.lastActionExecution = performance.now();
          this.fireAxisAction(axisIndex, axis.valueOf());
        }
      }
    } else {
      if (axisCache) {
        cache = cache.filter((ac) => ac.index !== axisIndex);
      }
    }

    this.activeAxesCaches[gamepad.index] = cache;
  }

  ngOnDestroy(): void {
    for (const interval of this.checkIntervals) {
      clearInterval(interval);
    }
  }
}
