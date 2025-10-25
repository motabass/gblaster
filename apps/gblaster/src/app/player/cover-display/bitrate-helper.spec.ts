import { formatBitrate } from './bitrate-helper';

describe('formatBitrate', () => {
  it('should format bitrate in bits per second to kb/s', () => {
    expect(formatBitrate(320_000)).toBe('320 kb/s');
    expect(formatBitrate(256_000)).toBe('256 kb/s');
    expect(formatBitrate(192_000)).toBe('192 kb/s');
    expect(formatBitrate(128_000)).toBe('128 kb/s');
  });

  it('should round bitrate values', () => {
    expect(formatBitrate(320_500)).toBe('321 kb/s');
    expect(formatBitrate(320_400)).toBe('320 kb/s');
    expect(formatBitrate(127_600)).toBe('128 kb/s');
  });

  it('should handle null values', () => {
    expect(formatBitrate(null)).toBe('0 kb/s');
  });

  it('should handle undefined values', () => {
    expect(formatBitrate(undefined)).toBe('0 kb/s');
  });

  it('should handle zero values', () => {
    expect(formatBitrate(0)).toBe('0 kb/s');
  });

  it('should handle negative values', () => {
    expect(formatBitrate(-1000)).toBe('0 kb/s');
  });

  it('should handle very small positive values', () => {
    expect(formatBitrate(1)).toBe('0 kb/s');
    expect(formatBitrate(500)).toBe('1 kb/s');
  });

  it('should handle very large values', () => {
    expect(formatBitrate(1_000_000)).toBe('1000 kb/s');
    expect(formatBitrate(10_000_000)).toBe('10000 kb/s');
  });

  it('should handle infinity', () => {
    expect(formatBitrate(Infinity)).toBe('0 kb/s');
    expect(formatBitrate(-Infinity)).toBe('0 kb/s');
  });

  it('should handle NaN', () => {
    expect(formatBitrate(Number.NaN)).toBe('0 kb/s');
  });

  it('should format common audio bitrates correctly', () => {
    expect(formatBitrate(64_000)).toBe('64 kb/s');
    expect(formatBitrate(96_000)).toBe('96 kb/s');
    expect(formatBitrate(160_000)).toBe('160 kb/s');
    expect(formatBitrate(224_000)).toBe('224 kb/s');
  });
});
