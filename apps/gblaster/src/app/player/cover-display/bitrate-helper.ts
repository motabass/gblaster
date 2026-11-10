/**
 * Formats a bitrate value in bits per second as a readable string.
 * @param value Bitrate in bits per second.
 * @returns A string such as "320 kb/s", or "0 kb/s" for invalid values.
 */
export function formatBitrate(value: number | null | undefined): string {
  if (value == null || value <= 0 || !Number.isFinite(value)) {
    return '0 kb/s';
  }

  const bitrate = Math.round(value / 1000);
  return `${bitrate} kb/s`;
}
