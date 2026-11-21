import type { OnDestroy } from '@angular/core';
import { Service } from '@angular/core';

export type ActionFunction = (buttonValue: number) => unknown;

export interface GamepadAction {
  index: number;
  mode: string;
  timeout: number;
  default?: boolean;
  axisDirection?: AxisDirection;
}

export interface AxisGamepadAction extends GamepadAction {
  positiveActionFunction: ActionFunction;
  negativeActionFunction: ActionFunction;
}

export interface ButtonGamepadAction extends GamepadAction {
  action: ActionFunction;
}

export type AxisDirection = 'negative' | 'positive';

export interface ActionCache {
  index: number;
  lastActionExecution: number;
}

export type InputCheckMode = 'click' | 'hold' | 'turbo';

export interface RumbleOptions {
  duration?: number;
  weakMagnitude?: number;
  strongMagnitude?: number;
  startDelay?: number;
}

export const gamepadButtons = {
  A_BUTTON: 0,
  B_BUTTON: 1,
  X_BUTTON: 2,
  Y_BUTTON: 3,
  L1_BUTTON: 4,
  R1_BUTTON: 5,
  L2_BUTTON: 6,
  R2_BUTTON: 7,
  SELECT_BUTTON: 8,
  START_BUTTON: 9,
  S1_BUTTON: 10,
  S2_BUTTON: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15
} as const;

export const gamepadAxes = {
  S1_X: 0,
  S1_Y: 1,
  S2_X: 2,
  S2_Y: 3
} as const;

/**
Maps connected gamepad buttons and axes to configured actions.
*/
@Service()
export class GamepadService implements OnDestroy {
  readonly #DEFAULT_TURBO_TIMEOUT = 300;
  readonly #DEFAULT_DEADSPACE = 0.07;

  readonly #checkIntervals: ReturnType<typeof setInterval>[] = [];
  readonly #pressedButtonsCaches: ActionCache[][] = [];
  readonly #activeAxesCaches: ActionCache[][] = [];

  readonly #buttonActions: ButtonGamepadAction[] = [];
  /**
  Configured positive- and negative-direction actions for each gamepad axis.
  */
  axisActions: AxisGamepadAction[] = [];

  /**
  Initializes default button and axis actions and observes gamepad connections.
  */
  constructor() {
    for (const buttonIndex of Object.values(gamepadButtons)) {
      this.#buttonActions.push(this.#createDefaultButtonAction(buttonIndex));
    }
    for (const axisIndex of Object.values(gamepadAxes)) {
      this.axisActions.push(this.#createDefaultAxisAction(axisIndex));
    }

    addEventListener('gamepadconnected', (event: GamepadEvent) => this.#connectionListener(event));
    addEventListener('gamepaddisconnected', (event: GamepadEvent) => this.#disconnectionListener(event));
  }

  /**
  Starts polling a newly connected gamepad for button and axis input.
  @param event Browser event describing the newly connected gamepad.
  */
  #connectionListener(event: GamepadEvent) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[event.gamepad.index];
    console.log(`New gamepad with Number ${event.gamepad.index} connected: `);
    console.log(gamepad);

    this.#checkIntervals[event.gamepad.index] = setInterval(() => {
      const gps = navigator.getGamepads();
      const gp = gps[event.gamepad.index];

      if (!gp) {
        return;
      }

      for (const buttonIndex of Object.values(gamepadButtons)) {
        this.#checkForButtonClicked(gp, buttonIndex);
      }

      for (const axisIndex of Object.values(gamepadAxes)) {
        this.#checkForAxesInput(gp, axisIndex);
      }
    }, 16);
  }

  /**
  Creates the default no-op action configuration for a gamepad button.
  @param buttonIndex Index of the button to configure.
  */
  #createDefaultButtonAction(buttonIndex: number): ButtonGamepadAction {
    return {
      action: () => console.log('Button nicht zugewiesen'),
      mode: 'hold',
      index: buttonIndex,
      timeout: this.#DEFAULT_TURBO_TIMEOUT,
      default: true
    };
  }

  /**
  Creates the default no-op action configuration for a gamepad axis.
  @param axisIndex Index of the axis to configure.
  */
  #createDefaultAxisAction(axisIndex: number): AxisGamepadAction {
    return {
      positiveActionFunction: () => console.log('Positiv-Achse nicht zugewiesen'),
      negativeActionFunction: () => console.log('Negativ-Achse nicht zugewiesen'),
      mode: 'hold',
      index: axisIndex,
      timeout: this.#DEFAULT_TURBO_TIMEOUT,
      default: true,
      axisDirection: 'positive'
    };
  }

  /**
  Stops polling a gamepad after it disconnects.
  @param event Browser event describing the disconnected gamepad.
  */
  #disconnectionListener(event: GamepadEvent) {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[event.gamepad.index];
    console.log(`Gamepad ${event.gamepad.index} disconnected!`);
    if (gamepad === null) {
      clearInterval(this.#checkIntervals[event.gamepad.index]);
    }
  }

  /**
  Invokes a registered button action and triggers brief haptic feedback.
  @param index Index of the button action to invoke.
  @param value Current button value.
  */
  #fireButtonAction(index: number, value: number) {
    console.log(`Button ${index} sending value: ${value}`);
    this.#buttonActions[index].action(value);
    this.#triggerRumble({ duration: 50, weakMagnitude: 1, strongMagnitude: 0.2 });
  }

  /**
  Invokes the action for an axis direction and triggers haptic feedback.
  @param index Index of the axis action to invoke.
  @param value Current axis value.
  */
  #fireAxisAction(index: number, value: number) {
    console.log(`Axis ${index} sending value: ${value}`);
    if (value < 0) {
      this.axisActions[index].negativeActionFunction(Math.abs(value));
    }
    if (value > 0) {
      this.axisActions[index].positiveActionFunction(value);
    }
    this.#triggerRumble({ duration: 10, weakMagnitude: 0.2, strongMagnitude: 0 });
  }

  /**
  Triggers haptic feedback on each connected gamepad that supports rumble.
  @param options Rumble configuration options.
  */
  #triggerRumble(options: RumbleOptions): void {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad?.vibrationActuator) {
        void this.#playRumble(gamepad.vibrationActuator, options);
      }
    }
  }

  async #playRumble(actuator: GamepadHapticActuator, options: RumbleOptions): Promise<void> {
    try {
      await actuator.playEffect('dual-rumble', {
        duration: options.duration ?? 200,
        weakMagnitude: options.weakMagnitude ?? 0.5,
        strongMagnitude: options.strongMagnitude ?? 0.5,
        startDelay: options.startDelay ?? 0
      });
    } catch (error) {
      console.warn('Rumble not supported or failed:', error);
    }
  }

  /**
  Registers an action for a button index.
  @param buttonIndex Index of the gamepad button.
  @param actionFunction Function invoked when the button action fires.
  @param mode Input mode used to detect button presses.
  @param timeout Minimum interval between repeated turbo actions, in milliseconds.
  */
  registerButtonAction(
    buttonIndex: number,
    actionFunction: ActionFunction,
    mode: InputCheckMode = 'click',
    timeout = this.#DEFAULT_TURBO_TIMEOUT
  ) {
    if (!this.#buttonActions[buttonIndex].default) {
      console.warn('Diesem Button wurde bereits eine Action zugewiesen.');
    }

    this.#buttonActions[buttonIndex] = {
      action: actionFunction,
      mode: mode,
      timeout: timeout,
      index: buttonIndex
    };
  }

  /**
  Restores the default action for a button index.
  @param buttonIndex Index of the button to reset.
  */
  deregisterButtonAction(buttonIndex: number) {
    this.#buttonActions[buttonIndex] = this.#createDefaultButtonAction(buttonIndex);
  }

  /**
  Registers positive- and negative-direction actions for an axis index.
  @param axisIndex Index of the gamepad axis.
  @param positiveActionFunction Function invoked for positive axis movement.
  @param negativeActionFunction Function invoked for negative axis movement.
  @param mode Input mode used to detect axis movement.
  @param turboTimeout Minimum interval between repeated turbo actions, in milliseconds.
  */
  registerAxisAction(
    axisIndex: number,
    positiveActionFunction: ActionFunction,
    negativeActionFunction: ActionFunction,
    mode: InputCheckMode = 'click',
    turboTimeout = this.#DEFAULT_TURBO_TIMEOUT
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

  /**
  Restores the default action for an axis index.
  @param axisIndex Index of the axis to reset.
  */
  deregisterAxisAction(axisIndex: number) {
    this.axisActions[axisIndex] = this.#createDefaultAxisAction(axisIndex);
  }

  /**
  Detects button presses and applies the configured click, hold, or turbo mode.
  @param gamepad Gamepad whose button state should be checked.
  @param buttonIndex Index of the button to inspect.
  */
  #checkForButtonClicked(gamepad: Gamepad, buttonIndex: number) {
    const button = gamepad.buttons[buttonIndex];
    if (!button) {
      return;
    }

    if (this.#buttonActions[buttonIndex].mode === 'hold' && button.pressed) {
      this.#fireButtonAction(buttonIndex, button.value);
      return;
    }

    let cache = (this.#pressedButtonsCaches[gamepad.index] ??= []);
    const buttonCache = cache.find((ac) => ac.index === buttonIndex);
    if (button.pressed) {
      if (buttonCache) {
        const timeout = this.#buttonActions[buttonIndex].timeout ?? this.#DEFAULT_TURBO_TIMEOUT;
        if (
          this.#buttonActions[buttonIndex].mode === 'turbo' &&
          performance.now() - buttonCache.lastActionExecution > timeout
        ) {
          buttonCache.lastActionExecution = performance.now();
          this.#fireButtonAction(buttonIndex, button.value);
        }
      } else {
        cache.push({
          index: buttonIndex,
          lastActionExecution: performance.now()
        });
        this.#fireButtonAction(buttonIndex, button.value);
      }
    } else {
      if (buttonCache) {
        cache = cache.filter((ac) => ac.index !== buttonIndex);
      }
    }

    this.#pressedButtonsCaches[gamepad.index] = cache;
  }

  /**
  Checks whether an axis value is outside the configured dead zone.
  @param axis Current axis value.
  */
  #isAxisValueInDetectionRange(axis: number): boolean {
    return axis.valueOf() > this.#DEFAULT_DEADSPACE || axis.valueOf() < 0 - this.#DEFAULT_DEADSPACE;
  }

  /**
  Detects axis movement and applies the configured input mode.
  @param gamepad Gamepad whose axis state should be checked.
  @param axisIndex Index of the axis to inspect.
  */
  #checkForAxesInput(gamepad: Gamepad, axisIndex: number) {
    const axis = gamepad.axes[axisIndex];
    if (!axis) {
      return;
    }

    // TODO: option for log and fixed

    const axisAction = this.axisActions[axisIndex];

    if (axisAction.mode === 'hold' && this.#isAxisValueInDetectionRange(axis)) {
      this.#fireAxisAction(axisIndex, axis.valueOf());
      return;
    }

    // TODO: move init to connect
    let cache = (this.#activeAxesCaches[gamepad.index] ??= []);
    const axisCache = cache.find((ac) => ac.index === axisIndex);
    if (this.#isAxisValueInDetectionRange(axis)) {
      if (axisCache) {
        const timeout = axisAction.timeout ?? this.#DEFAULT_TURBO_TIMEOUT;
        if (axisAction.mode === 'turbo' && performance.now() - axisCache.lastActionExecution > timeout) {
          axisCache.lastActionExecution = performance.now();
          this.#fireAxisAction(axisIndex, axis.valueOf());
        }
      } else {
        cache.push({
          index: axisIndex,
          lastActionExecution: performance.now()
        });
        this.#fireAxisAction(axisIndex, axis.valueOf());
      }
    } else {
      if (axisCache) {
        cache = cache.filter((ac) => ac.index !== axisIndex);
      }
    }

    this.#activeAxesCaches[gamepad.index] = cache;
  }

  /**
  Stops polling intervals when the gamepad service is destroyed.
  */
  ngOnDestroy(): void {
    for (const interval of this.#checkIntervals) {
      clearInterval(interval);
    }
  }
}
