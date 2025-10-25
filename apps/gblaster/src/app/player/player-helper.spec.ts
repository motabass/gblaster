import { getRandomInt } from './player-helper';

describe('getRandomInt', () => {
  it('should return a number within the specified range', () => {
    const min = 1;
    const max = 10;

    for (let i = 0; i < 100; i++) {
      const result = getRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }
  });

  it('should return an integer', () => {
    const min = 0;
    const max = 100;

    for (let i = 0; i < 50; i++) {
      const result = getRandomInt(min, max);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should handle min equal to max', () => {
    const value = 5;
    const result = getRandomInt(value, value);
    expect(result).toBe(value);
  });

  it('should handle range of 0 to 0', () => {
    const result = getRandomInt(0, 0);
    expect(result).toBe(0);
  });

  it('should handle large numbers', () => {
    const min = 1000;
    const max = 2000;

    for (let i = 0; i < 50; i++) {
      const result = getRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should handle negative numbers', () => {
    const min = -10;
    const max = -5;

    for (let i = 0; i < 50; i++) {
      const result = getRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should handle mixed negative and positive range', () => {
    const min = -5;
    const max = 5;

    for (let i = 0; i < 50; i++) {
      const result = getRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should handle decimal inputs by flooring/ceiling', () => {
    const result = getRandomInt(1.7, 5.3);
    expect(result).toBeGreaterThanOrEqual(2); // ceil(1.7)
    expect(result).toBeLessThanOrEqual(5); // floor(5.3)
    expect(Number.isInteger(result)).toBe(true);
  });
});
