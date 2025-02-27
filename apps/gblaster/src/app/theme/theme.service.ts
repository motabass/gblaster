import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TinyColor } from '@thebespokepixel/es-tinycolor';
import { LocalStorage } from 'ngx-webstorage';
import { Color } from './theme.types';
import { FALLBACK_ACCENT_COLOR, FALLBACK_PRIMARY_COLOR } from './default-colors';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private meta = inject(Meta);

  primaryColor = FALLBACK_PRIMARY_COLOR;

  accentColor = FALLBACK_ACCENT_COLOR;

  @LocalStorage('darkMode', true) _darkMode!: boolean;

  primaryColorPalette: Color[] = [];
  accentColorPalette: Color[] = [];

  initializeTheme() {
    if (globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
      this._darkMode = true;
    }
    this.setOverlayClass();
    this.setPrimaryColor(this.primaryColor);
    this.setAccentColor(this.accentColor);
  }

  get darkMode(): boolean {
    return this._darkMode;
  }

  set darkMode(darkMode: boolean) {
    this._darkMode = darkMode;
    this.setOverlayClass();
    // this.setPrimaryColor();
    // this.setAccentColor();
  }

  setPrimaryColor(color?: string) {
    this.primaryColor = color ? color : FALLBACK_PRIMARY_COLOR;
    this.primaryColorPalette = this.computeColors(this.primaryColor);

    for (const clr of this.primaryColorPalette) {
      const key1 = `--theme-primary-${clr.name}`;
      const value1 = clr.hex;
      const key2 = `--theme-primary-contrast-${clr.name}`;
      const value2 = clr.darkContrast ? 'rgba(0,0,0, 0.87)' : 'white';
      document.documentElement.style.setProperty(key1, value1);
      document.documentElement.style.setProperty(key2, value2);
    }

    this.meta.addTag({ name: 'theme-color', content: this.primaryColor }, true);
    this.meta.updateTag({ name: 'theme-color', content: this.primaryColor });
  }

  setAccentColor(color?: string) {
    this.accentColor = color ? color : FALLBACK_ACCENT_COLOR;
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
        const value3 = new TinyColor(clr.hex).setAlpha(0.54).toRgbString();
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
      this.getColorObject(new TinyColor(hex).lighten(52), '50'),
      this.getColorObject(new TinyColor(hex).lighten(37), '100'),
      this.getColorObject(new TinyColor(hex).lighten(26), '200'),
      this.getColorObject(new TinyColor(hex).lighten(12), '300'),
      this.getColorObject(new TinyColor(hex).lighten(6), '400'),
      this.getColorObject(new TinyColor(hex), '500'),
      this.getColorObject(new TinyColor(hex).darken(6), '600'),
      this.getColorObject(new TinyColor(hex).darken(12), '700'),
      this.getColorObject(new TinyColor(hex).darken(18), '800'),
      this.getColorObject(new TinyColor(hex).darken(24), '900'),
      this.getColorObject(new TinyColor(hex).lighten(50).saturate(30), 'a100'),
      this.getColorObject(new TinyColor(hex).lighten(30).saturate(30), 'a200'),
      this.getColorObject(new TinyColor(hex).lighten(10).saturate(15), 'a400'),
      this.getColorObject(new TinyColor(hex).lighten(5).saturate(5), 'a700')
    ];
  }

  private getColorObject(value: TinyColor, name: string): Color {
    const color = new TinyColor(value);
    const lightnessLimit = this.darkMode ? 150 : 200;
    return {
      name: name,
      hex: color.toHexString(false),
      darkContrast: color.getBrightness() > lightnessLimit
      // darkContrast: c.isLight()
    };
  }
}
