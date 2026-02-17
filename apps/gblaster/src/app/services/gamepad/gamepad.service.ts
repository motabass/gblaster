import { Injectable, OnDestroy } from '@angular/core';
import {
  ActionCache,
  ActionFunction,
  AxisGamepadAction,
  ButtonGamepadAction,
  GamepadAxes,
  GamepadButtons,
  InputCheckMode,
  RumbleOptions
} from './gamepad.types';

@Injectable({
  providedIn: 'root'
})
export class GamepadService implements OnDestroy {
  private readonly DEFAULT_TURBO_TIMEOUT = 300;
  private readonly DEFAULT_DEADSPACE = 0.07;

  private readonly checkIntervals: number[] = [];
  private readonly pressedButtonsCaches: ActionCache[][] = [];
  private readonly activeAxesCaches: ActionCache[][] = [];

  private readonly buttonActions: ButtonGamepadAction[] = [];
  axisActions: AxisGamepadAction[] = [];

  constructor() {
    for (const buttonIndex in GamepadButtons) {
      if (Number(buttonIndex) >= 0) {
        this.buttonActions.push(this.createDefaultButtonAction(Number(buttonIndex)));
      }
    }
    for (const axisIndex in GamepadAxes) {
      if (Number(axisIndex) >= 0) {
        this.axisActions.push(this.createDefaultAxisAction(Number(axisIndex)));
      }
    }

    addEventListener('gamepadconnected', (event: GamepadEvent) => this.connectionListener(event));
    addEventListener('gamepaddisconnected', (event: GamepadEvent) => this.disconnectionListener(event));
  }

  private connectionListener(event: GamepadEvent) {
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

  private createDefaultButtonAction(buttonIndex: number): ButtonGamepadAction {
    return {
      action: () => console.log('Button nicht zugewiesen'),
      mode: 'hold',
      index: buttonIndex,
      timeout: this.DEFAULT_TURBO_TIMEOUT,
      default: true
    };
  }

  private createDefaultAxisAction(axisIndex: number): AxisGamepadAction {
    return {
      positiveActionFunction: () => console.log('Positiv-Achse nicht zugewiesen'),
      negativeActionFunction: () => console.log('Negativ-Achse nicht zugewiesen'),
      mode: 'hold',
      index: axisIndex,
      timeout: this.DEFAULT_TURBO_TIMEOUT,
      default: true,
      axisDirection: 'positive'
    };
  }

  private disconnectionListener(event: GamepadEvent) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[event.gamepad.index];
    // console.log(`Gamepad ${event.gamepad.index} disconnected!`);
    if (gamepad === null) {
      clearInterval(this.checkIntervals[event.gamepad.index]);
    }
  }

  private fireButtonAction(index: number, value: number) {
    // console.log(`Button ${index} sending value: ${value}`);
    this.buttonActions[index].action(value);
    this.triggerRumble({ duration: 50, weakMagnitude: 1, strongMagnitude: 0.2 });
  }

  private fireAxisAction(index: number, value: number) {
    // console.log(`Axis ${index} sending value: ${value}`);
    if (value < 0) {
      this.axisActions[index].negativeActionFunction(Math.abs(value));
    }
    if (value > 0) {
      this.axisActions[index].positiveActionFunction(value);
    }
    this.triggerRumble({ duration: 10, weakMagnitude: 0.2, strongMagnitude: 0 });
  }

  /**
   * Triggers haptic feedback (rumble) on all connected gamepads
   * @param options Rumble configuration options
   */
  private triggerRumble(options: RumbleOptions): void {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad?.vibrationActuator) {
        gamepad.vibrationActuator
          .playEffect('dual-rumble', {
            duration: options.duration ?? 200,
            weakMagnitude: options.weakMagnitude ?? 0.5,
            strongMagnitude: options.strongMagnitude ?? 0.5,
            startDelay: options.startDelay ?? 0
          })
          .catch((error) => {
            console.warn('Rumble not supported or failed:', error);
          });
      }
    }
  }

  registerButtonAction(
    buttonIndex: number,
    actionFunction: ActionFunction,
    mode: InputCheckMode = 'click',
    timeout = this.DEFAULT_TURBO_TIMEOUT
  ) {
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

  registerAxisAction(
    axisIndex: number,
    positiveActionFunction: ActionFunction,
    negativeActionFunction: ActionFunction,
    mode: InputCheckMode = 'click',
    turboTimeout = this.DEFAULT_TURBO_TIMEOUT
  ) {
    if (!this.axisActions[axisIndex].default) {
      console.warn('Dieser Achse wurde bereits eine Action zugewiesen.');
    }

    this.axisActions[axisIndex] = {
      positiveActionFunction: positiveActionFunction,
      negativeActionFunction: negativeActionFunction,
      mode: mode,
      timeout: turboTimeout,
      index: axisIndex
    };
  }

  deregisterAxisAction(axisIndex: number) {
    this.axisActions[axisIndex] = this.createDefaultAxisAction(axisIndex);
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
      if (buttonCache) {
        const timeout = this.buttonActions[buttonIndex].timeout ?? this.DEFAULT_TURBO_TIMEOUT;
        if (
          this.buttonActions[buttonIndex].mode === 'turbo' &&
          performance.now() - buttonCache.lastActionExecution > timeout
        ) {
          buttonCache.lastActionExecution = performance.now();
          this.fireButtonAction(buttonIndex, button.value);
        }
      } else {
        cache.push({
          index: buttonIndex,
          lastActionExecution: performance.now()
        });
        this.fireButtonAction(buttonIndex, button.value);
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

    const axisAction = this.axisActions[axisIndex];

    if (axisAction.mode === 'hold' && this.isAxisValueInDetectionRange(axis)) {
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
      if (axisCache) {
        const timeout = axisAction.timeout ?? this.DEFAULT_TURBO_TIMEOUT;
        if (axisAction.mode === 'turbo' && performance.now() - axisCache.lastActionExecution > timeout) {
          axisCache.lastActionExecution = performance.now();
          this.fireAxisAction(axisIndex, axis.valueOf());
        }
      } else {
        cache.push({
          index: axisIndex,
          lastActionExecution: performance.now()
        });
        this.fireAxisAction(axisIndex, axis.valueOf());
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
