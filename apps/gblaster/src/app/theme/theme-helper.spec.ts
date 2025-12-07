import { colord } from 'colord';
import { computeColors, getThemeColor } from './theme-helper';

describe('theme-helper', () => {
  describe('computeColors', () => {
    it('should generate 16 color variants', () => {
      const colors = computeColors('#FF5733', false);
      expect(colors).toHaveLength(16);
    });

    it('should generate variants with correct suffixes', () => {
      const colors = computeColors('#FF5733', false);
      const expectedSuffixes = [
        '0',
        '10',
        '20',
        '25',
        '30',
        '35',
        '40',
        '50',
        '60',
        '70',
        '80',
        '90',
        '95',
        '98',
        '99',
        '100'
      ];

      for (const [index, color] of colors.entries()) {
        expect(color.name).toBe(expectedSuffixes[index]);
      }
    });

    it('should generate lighter colors for low suffixes', () => {
      const baseHex = '#FF5733';
      const colors = computeColors(baseHex, false);
      const baseColor = colord(baseHex);

      // Color variant '0' should be lighter than base
      const variant0 = colord(colors[0].hex);
      expect(variant0.brightness()).toBeGreaterThan(baseColor.brightness());
    });

    it('should generate darker colors for high suffixes', () => {
      const baseHex = '#FF5733';
      const colors = computeColors(baseHex, false);
      const baseColor = colord(baseHex);

      // Color variant '100' should be darker than base
      const variant100 = colord(colors[15].hex);
      expect(variant100.brightness()).toBeLessThan(baseColor.brightness());
    });

    it('should handle base color at suffix 50', () => {
      const baseHex = '#FF5733';
      const colors = computeColors(baseHex, false);
      const variant50 = colors.find((c) => c.name === '50');

      expect(variant50?.hex.toUpperCase()).toBe(baseHex.toUpperCase());
    });

    it('should generate valid hex colors', () => {
      const colors = computeColors('#FF5733', false);

      for (const color of colors) {
        expect(color.hex).toMatch(/^#[\dA-Fa-f]{6}$/);
      }
    });

    it('should work with dark mode enabled', () => {
      const colors = computeColors('#FF5733', true);
      expect(colors).toHaveLength(16);

      for (const color of colors) {
        expect(color.hex).toMatch(/^#[\dA-Fa-f]{6}$/);
      }
    });

    it('should handle different input color formats', () => {
      const colorsFromRgb = computeColors('rgb(255, 87, 51)', false);
      expect(colorsFromRgb).toHaveLength(16);

      const colorsFromShortHex = computeColors('#F53', false);
      expect(colorsFromShortHex).toHaveLength(16);
    });
  });

  describe('getThemeColor', () => {
    it('should create ThemeColor with correct properties', () => {
      const color = colord('#FF5733');
      const themeColor = getThemeColor(color, '50', false);

      expect(themeColor.name).toBe('50');
      expect(themeColor.hex).toBe('#ff5733');
      expect(typeof themeColor.darkContrast).toBe('boolean');
    });

    it('should set darkContrast to true for bright colors in light mode', () => {
      const brightColor = colord('#FFFFFF');
      const themeColor = getThemeColor(brightColor, '0', false);

      expect(themeColor.darkContrast).toBe(true);
    });

    it('should set darkContrast to false for dark colors in light mode', () => {
      const darkColor = colord('#000000');
      const themeColor = getThemeColor(darkColor, '100', false);

      expect(themeColor.darkContrast).toBe(false);
    });

    it('should use different brightness threshold for dark mode', () => {
      const color = colord('#999999');
      const lightModeTheme = getThemeColor(color, '50', false);
      const darkModeTheme = getThemeColor(color, '50', true);

      // Depending on the color brightness, these might differ
      expect(typeof lightModeTheme.darkContrast).toBe('boolean');
      expect(typeof darkModeTheme.darkContrast).toBe('boolean');
    });

    it('should return hex color in lowercase', () => {
      const color = colord('#FF5733');
      const themeColor = getThemeColor(color, '50', false);

      expect(themeColor.hex).toBe('#ff5733');
    });

    describe('lightness limits', () => {
      it('should use 0.5 brightness threshold in light mode', () => {
        // Test color just above threshold
        const brightColor = colord('#A0A0A0'); // brightness > 0.5
        const brightTheme = getThemeColor(brightColor, '50', false);
        expect(brightTheme.darkContrast).toBe(true);

        // Test color just below threshold
        const darkColor = colord('#606060'); // brightness < 0.5
        const darkTheme = getThemeColor(darkColor, '50', false);
        expect(darkTheme.darkContrast).toBe(false);
      });

      it('should use 0.3 brightness threshold in dark mode', () => {
        // Test color above dark mode threshold (0.3)
        const mediumColor = colord('#6A6A6A'); // brightness > 0.3
        const mediumTheme = getThemeColor(mediumColor, '50', true);
        expect(mediumTheme.darkContrast).toBe(true);

        // Test color below dark mode threshold
        const darkColor = colord('#303030'); // brightness < 0.3
        const darkTheme = getThemeColor(darkColor, '50', true);
        expect(darkTheme.darkContrast).toBe(false);
      });

      it('should set darkContrast true for colors with brightness > 0.5 in light mode', () => {
        const testCases = [
          { hex: '#FFFFFF', expectedDarkContrast: true }, // White
          { hex: '#CCCCCC', expectedDarkContrast: true }, // Light gray
          { hex: '#FFD700', expectedDarkContrast: true }, // Gold
          { hex: '#87CEEB', expectedDarkContrast: true } // Sky blue
        ];

        for (const { hex, expectedDarkContrast } of testCases) {
          const color = colord(hex);
          const themeColor = getThemeColor(color, '50', false);
          expect(themeColor.darkContrast).toBe(expectedDarkContrast);
        }
      });

      it('should set darkContrast false for colors with brightness <= 0.5 in light mode', () => {
        const testCases = [
          { hex: '#000000', expectedDarkContrast: false }, // Black
          { hex: '#333333', expectedDarkContrast: false }, // Dark gray
          { hex: '#8B0000', expectedDarkContrast: false }, // Dark red
          { hex: '#191970', expectedDarkContrast: false } // Midnight blue
        ];

        for (const { hex, expectedDarkContrast } of testCases) {
          const color = colord(hex);
          const themeColor = getThemeColor(color, '50', false);
          expect(themeColor.darkContrast).toBe(expectedDarkContrast);
        }
      });

      it('should set darkContrast true for colors with brightness > 0.3 in dark mode', () => {
        const testCases = [
          { hex: '#FFFFFF', expectedDarkContrast: true }, // White
          { hex: '#808080', expectedDarkContrast: true }, // Medium gray
          { hex: '#9370DB', expectedDarkContrast: true }, // Medium purple
          { hex: '#4682B4', expectedDarkContrast: true } // Steel blue
        ];

        for (const { hex, expectedDarkContrast } of testCases) {
          const color = colord(hex);
          const themeColor = getThemeColor(color, '50', true);
          expect(themeColor.darkContrast).toBe(expectedDarkContrast);
        }
      });

      it('should set darkContrast false for colors with brightness <= 0.3 in dark mode', () => {
        const testCases = [
          { hex: '#000000', expectedDarkContrast: false }, // Black
          { hex: '#1A1A1A', expectedDarkContrast: false }, // Very dark gray
          { hex: '#2F4F4F', expectedDarkContrast: false }, // Dark slate gray
          { hex: '#191970', expectedDarkContrast: false } // Midnight blue
        ];

        for (const { hex, expectedDarkContrast } of testCases) {
          const color = colord(hex);
          const themeColor = getThemeColor(color, '50', true);
          expect(themeColor.darkContrast).toBe(expectedDarkContrast);
        }
      });

      it('should handle different lightness thresholds for same color in light vs dark mode', () => {
        // A color with brightness between 0.3 and 0.5
        const color = colord('#656565'); // brightness ~0.4

        const lightModeTheme = getThemeColor(color, '50', false);
        const darkModeTheme = getThemeColor(color, '50', true);

        // In light mode (threshold 0.5): brightness 0.4 < 0.5 -> darkContrast false
        expect(lightModeTheme.darkContrast).toBe(false);

        // In dark mode (threshold 0.3): brightness 0.4 > 0.3 -> darkContrast true
        expect(darkModeTheme.darkContrast).toBe(true);
      });
    });
  });
});
