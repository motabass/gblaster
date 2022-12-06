export function formatSecondsAsClock(value: number, leadingMinuteZero = true): string {
  if (value > 0) {
    const durationSeconds = value;

    const minutes = Math.floor(durationSeconds / 60);

    const seconds = durationSeconds - minutes * 60;
    return `${minutes > 9 ? minutes : leadingMinuteZero ? '0' + minutes : minutes}:${seconds > 9 ? Math.round(seconds) : '0' + Math.round(seconds)}`;
  } else {
    return leadingMinuteZero ? '00:00' : '0:00';
  }
}
