export interface CoverColorPalette {
  vibrant?: CoverColor;
  muted?: CoverColor;
  darkVibrant?: CoverColor;
  darkMuted?: CoverColor;
  lightVibrant?: CoverColor;
  lightMuted?: CoverColor;
}

export interface CoverColor {
  hex?: string;
  textHex?: string;
}
