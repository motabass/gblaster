import { Injectable } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import tinycolor from 'tinycolor2';
import { Color } from './theme.types';

const DEFAULT_PRIMARY_COLOR = '#eb4818';
const DEFAULT_ACCENT_COLOR = '#abd222';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  @LocalStorage()
  primaryColor;
  @LocalStorage()
  accentColor;

  @LocalStorage('darkMode')
  _darkMode;

  primaryColorPalette: Color[] = [];
  accentColorPalette: Color[] = [];

  initializeTheme() {
    let autoDarkMode = false;

    if (window.matchMedia('prefers-color-scheme: dark').matches) {
      autoDarkMode = true;
    }

    this._darkMode = this._darkMode || autoDarkMode;
    this.setOverlayClass();
    this.setPrimaryColor(this.primaryColor || DEFAULT_PRIMARY_COLOR);
    this.setAccentColor(this.accentColor || DEFAULT_ACCENT_COLOR);
  }

  get darkMode(): boolean {
    return this._darkMode;
  }

  set darkMode(darkMode: boolean) {
    this._darkMode = darkMode;
    this.setOverlayClass();
    this.setPrimaryColor();
    this.setAccentColor();
  }

  setPrimaryColor(color?: string) {
    if (color) {
      this.primaryColor = color;
    }
    this.primaryColorPalette = this.computeColors(this.primaryColor);

    for (const clr of this.primaryColorPalette) {
      const key1 = `--theme-primary-${clr.name}`;
      const value1 = clr.hex;
      const key2 = `--theme-primary-contrast-${clr.name}`;
      const value2 = clr.darkContrast ? 'rgba(0,0,0, 0.87)' : 'white';
      document.documentElement.style.setProperty(key1, value1);
      document.documentElement.style.setProperty(key2, value2);
    }
  }

  setAccentColor(color?: string) {
    if (color) {
      this.accentColor = color;
    }
    this.accentColorPalette = this.computeColors(this.accentColor);

    for (const clr of this.accentColorPalette) {
      const key1 = `--theme-accent-${clr.name}`;
      const value1 = clr.hex;
      const key2 = `--theme-accent-contrast-${clr.name}`;
      const value2 = clr.darkContrast ? 'rgba(0,0,0, 0.87)' : 'white';
      document.documentElement.style.setProperty(key1, value1);
      document.documentElement.style.setProperty(key2, value2);

      if (clr.name === '500') {
        const key3 = `--theme-accent-light`;
        const value3 = tinycolor(clr.hex)
          .setAlpha(0.54)
          .toRgbString();
        document.documentElement.style.setProperty(key3, value3);
      }
    }
  }

  private setOverlayClass() {
    if (this.darkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  private computeColors(hex: string): Color[] {
    return [
      this.getColorObject(tinycolor(hex).lighten(52), '50'),
      this.getColorObject(tinycolor(hex).lighten(37), '100'),
      this.getColorObject(tinycolor(hex).lighten(26), '200'),
      this.getColorObject(tinycolor(hex).lighten(12), '300'),
      this.getColorObject(tinycolor(hex).lighten(6), '400'),
      this.getColorObject(tinycolor(hex), '500'),
      this.getColorObject(tinycolor(hex).darken(6), '600'),
      this.getColorObject(tinycolor(hex).darken(12), '700'),
      this.getColorObject(tinycolor(hex).darken(18), '800'),
      this.getColorObject(tinycolor(hex).darken(24), '900'),
      this.getColorObject(
        tinycolor(hex)
          .lighten(50)
          .saturate(30),
        'A100'
      ),
      this.getColorObject(
        tinycolor(hex)
          .lighten(30)
          .saturate(30),
        'A200'
      ),
      this.getColorObject(
        tinycolor(hex)
          .lighten(10)
          .saturate(15),
        'A400'
      ),
      this.getColorObject(
        tinycolor(hex)
          .lighten(5)
          .saturate(5),
        'A700'
      )
    ];
  }

  private getColorObject(value, name): Color {
    const color = tinycolor(value);
    const lightnessLimit = this.darkMode ? 150 : 200;
    return {
      name: name,
      hex: color.toHexString(),
      darkContrast: color.getBrightness() > lightnessLimit
      // darkContrast: c.isLight()
    };
  }
}
