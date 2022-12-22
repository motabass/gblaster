import { formatSecondsAsClock } from '@motabass/helpers';

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
});
