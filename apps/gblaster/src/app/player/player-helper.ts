/**
Generates a random integer between the given inclusive bounds.
@param min Minimum value, inclusive.
@param max Maximum value, inclusive.
@returns A random integer from min through max.
*/
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  // eslint-disable-next-line sonarjs/pseudo-random
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
