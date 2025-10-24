/**
 * Formats a bitrate value in bits per second to a readable string
 * @param value The bitrate in bits per second
 * @returns A formatted string like "320 kb/s" or "0 kb/s" for invalid values
 */
export function formatBitrate(value: number | null | undefined): string {
  if (value == null || value <= 0 || !Number.isFinite(value)) {
    return '0 kb/s';
  }

  const bitrate = Math.round(value / 1000);
  return `${bitrate} kb/s`;
}
