import { colord } from 'colord';
import { computeColors, getThemeColor } from './theme-helper';

describe('theme-helper', () => {
  describe('computeColors', () => {
    it('generates the expected variants with the exact source color at 50', () => {
      const palette = computeColors('#FF5733');

      expect(palette.map((color) => color.name)).toEqual([
        '0',
        '1',
        '2',
        '5',
        '10',
        '20',
        '25',
        '30',
        '35',
        '40',
        '50',
        '60',
        '65',
        '70',
        '75',
        '80',
        '90',
        '95',
        '98',
        '99',
        '100'
      ]);
      expect(palette.find((color) => color.name === '50')?.hex).toBe('#ff5733');
      expect(palette[0].hex).toBe('#000000');
      expect(palette.at(-1)?.hex).toBe('#ffffff');
    });

    it.each(['#ff5733', '#2196f3', '#808080', '#000000', '#ffffff'])(
      'produces increasingly lighter shades for %s',
      (source) => {
        const palette = computeColors(source);
        const lightness = palette.map((color) => colord(color.hex).toLch().l);

        for (let index = 1; index < lightness.length; index++) {
          expect(lightness[index]).toBeGreaterThanOrEqual(lightness[index - 1]);
        }
      }
    );

    it('keeps the previous shade colors under their reversed names', () => {
      const palette = computeColors('#ff5733');
      const expected = {
        '0': '#000000',
        '10': '#331910',
        '20': '#61281a',
        '30': '#923822',
        '40': '#c7472a',
        '50': '#ff5733',
        '60': '#ff7e5a',
        '70': '#ffa081',
        '80': '#ffc0aa',
        '90': '#ffe0d4',
        '100': '#ffffff'
      };

      for (const [name, hex] of Object.entries(expected)) {
        expect(palette.find((color) => color.name === name)?.hex).toBe(hex);
      }
    });

    it('generates distinct shades for different source colors', () => {
      const red = computeColors('#f44336');
      const blue = computeColors('#2196f3');

      for (const name of ['25', '50', '95']) {
        expect(red.find((color) => color.name === name)?.hex).not.toBe(blue.find((color) => color.name === name)?.hex);
      }
    });

    it('accepts short hexadecimal and RGB inputs', () => {
      expect(computeColors('#f53').find((color) => color.name === '50')?.hex).toBe('#ff5533');
      expect(computeColors('rgb(255, 87, 51)').find((color) => color.name === '50')?.hex).toBe('#ff5733');
    });

    it('uses opaque colors even when the input includes alpha', () => {
      expect(computeColors('#ff573380').find((color) => color.name === '50')?.hex).toBe('#ff5733');
    });

    it('rejects invalid colors', () => {
      expect(() => computeColors('not a color')).toThrow('Invalid theme color: not a color');
    });
  });

  describe('getThemeColor', () => {
    it.each([
      ['#000000', false],
      ['#ffffff', true],
      ['#757575', false],
      ['#767676', true],
      ['#ff0000', true],
      ['#0000ff', false]
    ])('selects the accessible contrast for %s', (hex, darkContrast) => {
      expect(getThemeColor(colord(hex), '50')).toEqual({ name: '50', hex, darkContrast });
    });

    it.each(['#ff5733', '#2196f3', '#808080', '#000000', '#ffffff'])(
      'selects a foreground with at least 4.5:1 contrast for every shade of %s',
      (source) => {
        for (const color of computeColors(source)) {
          const foreground = color.darkContrast ? '#000000' : '#ffffff';
          expect(colord(color.hex).contrast(foreground)).toBeGreaterThanOrEqual(4.5);
        }
      }
    );
  });
});
