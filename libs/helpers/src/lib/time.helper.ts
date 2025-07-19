export function formatSecondsAsClock(value: number | undefined, leadingMinuteZero = true): string {
  if (value === undefined) {
    return leadingMinuteZero ? '00:00' : '0:00';
  }

  if (value > 0) {
    // Round the total seconds first
    const totalSeconds = Math.round(value);

    // Calculate minutes and seconds properly
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60; // Using modulo to ensure 0-59 range

    // Format the output string
    const formattedMinutes = minutes > 9 ? minutes : leadingMinuteZero ? '0' + minutes : minutes;
    const formattedSeconds = seconds > 9 ? seconds : '0' + seconds;

    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    return leadingMinuteZero ? '00:00' : '0:00';
  }
}
