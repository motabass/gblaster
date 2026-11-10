import { OnDestroy, Service } from '@angular/core';
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

/**
Maps connected gamepad buttons and axes to configured actions.
*/
@Service()
export class GamepadService implements OnDestroy {
  readonly #DEFAULT_TURBO_TIMEOUT = 300;
  readonly #DEFAULT_DEADSPACE = 0.07;

  readonly #checkIntervals: number[] = [];
  readonly #pressedButtonsCaches: ActionCache[][] = [];
  readonly #activeAxesCaches: ActionCache[][] = [];

  readonly #buttonActions: ButtonGamepadAction[] = [];
  axisActions: AxisGamepadAction[] = [];

  /**
  Initializes default button and axis actions and observes gamepad connections.
  */
  constructor() {
    for (const buttonIndex in GamepadButtons) {
      if (Number(buttonIndex) >= 0) {
        this.#buttonActions.push(this.#createDefaultButtonAction(Number(buttonIndex)));
      }
    }
    for (const axisIndex in GamepadAxes) {
      if (Number(axisIndex) >= 0) {
        this.axisActions.push(this.#createDefaultAxisAction(Number(axisIndex)));
      }
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

    this.#checkIntervals[event.gamepad.index] = window.setInterval(() => {
      const gps = navigator.getGamepads();
      const gp = gps[event.gamepad.index];

      if (!gp) {
        return;
      }

      for (const buttonIndex in GamepadButtons) {
        if (Number(buttonIndex) >= 0) {
          this.#checkForButtonClicked(gp, Number(buttonIndex));
        }
      }

      for (const axisIndex in GamepadAxes) {
        if (Number(axisIndex) >= 0) {
          this.#checkForAxesInput(gp, Number(axisIndex));
        }
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
    // console.log(`Gamepad ${event.gamepad.index} disconnected!`);
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
    // console.log(`Button ${index} sending value: ${value}`);
    this.#buttonActions[index].action(value);
    this.#triggerRumble({ duration: 50, weakMagnitude: 1, strongMagnitude: 0.2 });
  }

  /**
  Invokes the action for an axis direction and triggers haptic feedback.
  @param index Index of the axis action to invoke.
  @param value Current axis value.
  */
  #fireAxisAction(index: number, value: number) {
    // console.log(`Axis ${index} sending value: ${value}`);
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

    if (!this.#pressedButtonsCaches[gamepad.index]) {
      this.#pressedButtonsCaches[gamepad.index] = [];
    }

    let cache = this.#pressedButtonsCaches[gamepad.index];
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
    if (!this.#activeAxesCaches[gamepad.index]) {
      this.#activeAxesCaches[gamepad.index] = [];
    }

    let cache = this.#activeAxesCaches[gamepad.index];
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
