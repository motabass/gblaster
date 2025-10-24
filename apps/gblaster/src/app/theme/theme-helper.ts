import { Colord, colord } from 'colord';
import { ThemeColor } from './theme.types';

interface ColorVariant {
  suffix: string;
  lightenFactor?: number;
  darkenFactor?: number;
}

const COLOR_VARIANTS: ColorVariant[] = [
  { suffix: '0', lightenFactor: 0.55 },
  { suffix: '10', lightenFactor: 0.45 },
  { suffix: '20', lightenFactor: 0.35 },
  { suffix: '25', lightenFactor: 0.3 },
  { suffix: '30', lightenFactor: 0.25 },
  { suffix: '35', lightenFactor: 0.2 },
  { suffix: '40', lightenFactor: 0.15 },
  { suffix: '50' },
  { suffix: '60', darkenFactor: 0.05 },
  { suffix: '70', darkenFactor: 0.1 },
  { suffix: '80', darkenFactor: 0.15 },
  { suffix: '90', darkenFactor: 0.18 },
  { suffix: '95', darkenFactor: 0.21 },
  { suffix: '98', darkenFactor: 0.24 },
  { suffix: '99', darkenFactor: 0.27 },
  { suffix: '100', darkenFactor: 0.3 }
];

/**
 * Computes a color palette from a base color by generating lighter and darker variants
 * @param hex The base color in hex format
 * @param isDarkMode Whether dark mode is enabled
 * @returns An array of ThemeColor objects
 */
export function computeColors(hex: string, isDarkMode: boolean): ThemeColor[] {
  const baseColor = colord(hex);

  return COLOR_VARIANTS.map((variant) => {
    let color = baseColor;

    if (variant.lightenFactor) {
      color = baseColor.lighten(variant.lightenFactor);
    } else if (variant.darkenFactor) {
      color = baseColor.darken(variant.darkenFactor);
    }

    return getThemeColor(color, variant.suffix, isDarkMode);
  });
}

/**
 * Creates a ThemeColor object from a Colord color instance
 * @param color The Colord color instance
 * @param name The name/suffix for this color variant
 * @param isDarkMode Whether dark mode is enabled
 * @returns A ThemeColor object
 */
export function getThemeColor(color: Colord, name: string, isDarkMode: boolean): ThemeColor {
  const lightnessLimit = isDarkMode ? 150 : 200;
  return {
    name,
    hex: color.toHex(),
    darkContrast: color.brightness() > lightnessLimit
  };
}
