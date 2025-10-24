import { VisualizerMode } from './visuals.types';

/**
 * Gets the next visualizer mode in the cycle
 * @param currentMode The current visualizer mode
 * @returns The next visualizer mode
 */
export function getNextVisualizerMode(currentMode: VisualizerMode): VisualizerMode {
  switch (currentMode) {
    case 'off': {
      return 'bars';
    }
    case 'bars': {
      return 'circular-bars';
    }
    case 'circular-bars': {
      return 'osc';
    }
    case 'osc': {
      return 'circular-osc';
    }
    case 'circular-osc': {
      return 'off';
    }
  }
}
