import { formatSecondsAsClock } from '@motabass/helpers/time';

describe('helpersTime', () => {
  it('should work', () => {
    expect(formatSecondsAsClock(10)).toEqual('00:10');
    expect(formatSecondsAsClock(60)).toEqual('01:00');
    expect(formatSecondsAsClock(60, false)).toEqual('1:00');
    expect(formatSecondsAsClock(255, false)).toEqual('4:15');
  });
});
