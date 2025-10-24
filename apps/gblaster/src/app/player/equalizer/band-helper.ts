import { FrequencyBand } from '../player.types';

/**
 * Formats a frequency band value for display
 * @param value The frequency band value in Hz
 * @returns A formatted string like "1K" for 1000 Hz or "250" for 250 Hz
 */
export function formatFrequencyBand(value: FrequencyBand): string {
  if (!value || value < 0) {
    return '';
  }

  if (value >= 1000) {
    const kValue = value / 1000;
    return kValue % 1 === 0 ? `${Math.floor(kValue)}K` : `${kValue.toFixed(1)}K`;
  }

  return value.toString();
}
