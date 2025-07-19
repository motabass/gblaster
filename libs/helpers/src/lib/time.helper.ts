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

function formatWithLeadingZero(value: number, useLeadingZero: boolean): string {
  if (value > 9 || !useLeadingZero) {
    return value.toString();
  }
  return '0' + value;
}
