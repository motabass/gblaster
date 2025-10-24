/**
 * Generates a random integer between min and max (inclusive)
 * @param min The minimum value (inclusive)
 * @param max The maximum value (inclusive)
 * @returns A random integer between min and max
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  // eslint-disable-next-line sonarjs/pseudo-random
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
