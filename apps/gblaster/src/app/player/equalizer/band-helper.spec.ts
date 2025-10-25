import { formatFrequencyBand } from './band-helper';

describe('formatFrequencyBand', () => {
  it('should format frequencies below 1000 Hz as plain numbers', () => {
    expect(formatFrequencyBand(31)).toBe('31');
    expect(formatFrequencyBand(63)).toBe('63');
    expect(formatFrequencyBand(125)).toBe('125');
    expect(formatFrequencyBand(250)).toBe('250');
    expect(formatFrequencyBand(500)).toBe('500');
  });

  it('should format frequencies at or above 1000 Hz with K suffix', () => {
    expect(formatFrequencyBand(1000)).toBe('1K');
    expect(formatFrequencyBand(2000)).toBe('2K');
    expect(formatFrequencyBand(4000)).toBe('4K');
    expect(formatFrequencyBand(8000)).toBe('8K');
    expect(formatFrequencyBand(16_000)).toBe('16K');
  });

  it('should handle frequencies with decimal K values', () => {
    expect(formatFrequencyBand(1500)).toBe('1.5K');
    expect(formatFrequencyBand(2500)).toBe('2.5K');
    expect(formatFrequencyBand(10_500)).toBe('10.5K');
  });

  it('should return empty string for zero or negative values', () => {
    expect(formatFrequencyBand(0)).toBe('');
    expect(formatFrequencyBand(-100)).toBe('');
  });

  it('should handle edge case at 999 Hz', () => {
    expect(formatFrequencyBand(999)).toBe('999');
  });

  it('should handle very large frequencies', () => {
    expect(formatFrequencyBand(20_000)).toBe('20K');
    expect(formatFrequencyBand(100_000)).toBe('100K');
  });

  it('should format decimal K values with one decimal place', () => {
    expect(formatFrequencyBand(1250)).toBe('1.3K'); // 1.25 rounds to 1.3
    expect(formatFrequencyBand(3750)).toBe('3.8K'); // 3.75 rounds to 3.8
  });
});
