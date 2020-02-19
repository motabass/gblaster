export function formatSecondsAsClock(value: number, leadingMinuteZero = true): string {
  if (value) {
    const durationSeconds = value;

    const minutes = Math.floor(durationSeconds / 60);

    const seconds = durationSeconds - minutes * 60;
    return `${minutes > 9 ? minutes : leadingMinuteZero ? '0' + minutes : minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
  } else {
    return leadingMinuteZero ? '00:00' : '0:00';
  }
}
