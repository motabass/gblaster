export type ActionFunction = (buttonValue: number) => void;

export interface GamepadAction {
  action: ActionFunction;
  index: number;
  mode: string;
  timeout: number;
  default?: boolean;
}

export interface ActionCache {
  index: number;
  lastActionExecution: number;
}

export type InputCheckMode = 'click' | 'hold' | 'turbo';

export enum GamepadButtons {
  A_BUTTON = 0,
  B_BUTTON = 1,
  X_BUTTON = 2,
  Y_BUTTON = 3,
  L1_BUTTON = 4,
  R1_BUTTON = 5,
  L2_BUTTON = 6,
  R2_BUTTON = 7,
  SELECT_BUTTON = 8,
  START_BUTTON = 9,
  S1_BUTTON = 10,
  S2_BUTTON = 11,
  DPAD_UP = 12,
  DPAD_DOWN = 13,
  DPAD_LEFT = 14,
  DPAD_RIGHT = 15
}

export enum GamepadAxes {
  S1_X = 0,
  S1_Y = 1,
  S2_X = 2,
  S2_Y = 3
}
