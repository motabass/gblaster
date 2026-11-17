import { Colord, colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import lchPlugin from 'colord/plugins/lch';

extend([a11yPlugin, lchPlugin]);

export interface ThemeColor {
  name: string;
  hex: string;
  darkContrast: boolean;
}

const COLOR_VARIANTS = [0, 1, 2, 5, 10, 20, 25, 30, 35, 40, 50, 60, 65, 70, 75, 80, 90, 95, 98, 99, 100];

/**
Computes an LCH palette centered on the source color.
@param hex Base color.
@returns Generated theme color variants.
*/
export function computeColors(hex: string): ThemeColor[] {
  const parsedColor = colord(hex);
  if (!parsedColor.isValid()) {
    throw new Error(`Invalid theme color: ${hex}`);
  }
  const sourceColor = parsedColor.alpha(1);
  const sourceLch = sourceColor.toLch();

  return COLOR_VARIANTS.map((variant) => {
    const lightness =
      variant <= 50 ? (sourceLch.l * variant) / 50 : sourceLch.l + ((100 - sourceLch.l) * (variant - 50)) / 50;
    const chroma = sourceLch.c * (1 - Math.abs(50 - variant) / 50);
    const color = variant === 50 ? sourceColor : colord({ ...sourceLch, l: lightness, c: chroma });

    return getThemeColor(color, String(variant));
  });
}

/**
Creates a theme color entry with the higher-contrast black or white foreground.
@param color Color instance.
@param name Name or suffix for this color variant.
@returns The theme color with its hexadecimal value and contrast setting.
*/
export function getThemeColor(color: Colord, name: string): ThemeColor {
  return {
    name,
    hex: color.toHex(),
    darkContrast: color.contrast('#000000') >= color.contrast('#ffffff')
  };
}
