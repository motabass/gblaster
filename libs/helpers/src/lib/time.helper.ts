/**
Formats a number of seconds as a minutes-and-seconds clock value.
@param value Number of seconds to format, or undefined for a zero duration.
@param leadingMinuteZero Whether to pad single-digit minutes with a leading zero.
@returns A clock string in the form "MM:SS" or "M:SS".
*/
export function formatSecondsAsClock(value: number | undefined, leadingMinuteZero = true): string {
  if (value === undefined || value <= 0) {
    return leadingMinuteZero ? '00:00' : '0:00';
  }

  // Round the total seconds first
  const totalSeconds = Math.round(value);

  // Calculate minutes and seconds properly
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Format minutes with leading zero if needed
  const formattedMinutes = formatWithLeadingZero(minutes, leadingMinuteZero);
  const formattedSeconds = formatWithLeadingZero(seconds, true);

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
Converts a number to a string with an optional leading zero.
@param value Number to format.
@param useLeadingZero Whether single-digit values should be zero-padded.
@returns The formatted number.
*/
function formatWithLeadingZero(value: number, useLeadingZero: boolean): string {
  if (value > 9 || !useLeadingZero) {
    return value.toString();
  }
  return '0' + value;
}
