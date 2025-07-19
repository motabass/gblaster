import { formatSecondsAsClock } from './time.helper';

describe('helpersTime', () => {
  it('formats seconds as clock string', () => {
    expect(formatSecondsAsClock(0)).toBe('00:00');
    expect(formatSecondsAsClock(10)).toEqual('00:10');
    expect(formatSecondsAsClock(30)).toBe('00:30');
    expect(formatSecondsAsClock(60)).toBe('01:00');
    expect(formatSecondsAsClock(65)).toBe('01:05');
    expect(formatSecondsAsClock(3600)).toBe('60:00');
  });

  it('formats seconds as clock string without leading minute zero', () => {
    expect(formatSecondsAsClock(0, false)).toBe('0:00');
    expect(formatSecondsAsClock(30, false)).toBe('0:30');
    expect(formatSecondsAsClock(60, false)).toBe('1:00');
    expect(formatSecondsAsClock(65, false)).toBe('1:05');
    expect(formatSecondsAsClock(255, false)).toEqual('4:15');
    expect(formatSecondsAsClock(3600, false)).toBe('60:00');
  });

  it('handles undefined values', () => {
    expect(formatSecondsAsClock(undefined)).toBe('00:00');
    expect(formatSecondsAsClock(undefined, false)).toBe('0:00');
  });

  it('handles negative values', () => {
    expect(formatSecondsAsClock(-10)).toBe('00:00');
    expect(formatSecondsAsClock(-60, false)).toBe('0:00');
  });

  it('handles decimal seconds with rounding', () => {
    expect(formatSecondsAsClock(10.4)).toBe('00:10');
    expect(formatSecondsAsClock(10.5)).toBe('00:11');
    expect(formatSecondsAsClock(59.9)).toBe('01:00');
    expect(formatSecondsAsClock(99.5, false)).toBe('1:40');
  });

  it('formats larger time values correctly', () => {
    expect(formatSecondsAsClock(3661)).toBe('61:01');
    expect(formatSecondsAsClock(7200)).toBe('120:00');
    expect(formatSecondsAsClock(7200, false)).toBe('120:00');
  });

  it('handles second boundaries correctly', () => {
    expect(formatSecondsAsClock(59.4)).toBe('00:59');
    expect(formatSecondsAsClock(59.5)).toBe('01:00');
    expect(formatSecondsAsClock(119.5)).toBe('02:00');
  });

  it('formats double-digit minutes correctly', () => {
    expect(formatSecondsAsClock(600)).toBe('10:00');
    expect(formatSecondsAsClock(659)).toBe('10:59');
    expect(formatSecondsAsClock(600, false)).toBe('10:00');
  });
});
