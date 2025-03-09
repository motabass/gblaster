import { inject, Injectable, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TinyColor } from '@thebespokepixel/es-tinycolor';
import { LocalStorageService } from 'ngx-webstorage';
import { Color } from './theme.types';
import { FALLBACK_ACCENT_COLOR, FALLBACK_PRIMARY_COLOR } from './default-colors';
import { ColorConfig } from '../player/player.types';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private meta = inject(Meta);
  private localStorageService = inject(LocalStorageService);

  private primaryColor = FALLBACK_PRIMARY_COLOR;

  private accentColor = FALLBACK_ACCENT_COLOR;

  readonly darkMode = signal<boolean>(this.localStorageService.retrieve('darkMode') ?? globalThis.matchMedia('(prefers-color-scheme: dark)').matches);

  primaryColorPalette: Color[] = [];
  accentColorPalette: Color[] = [];

  initializeTheme() {
    this.setOverlayClass();
    this.setPrimaryColor(this.primaryColor);
    this.setAccentColor(this.accentColor);
  }

  setDarkMode(darkMode: boolean) {
    this.darkMode.set(darkMode);
    this.localStorageService.store('darkMode', darkMode);
    this.setOverlayClass();
  }

  setColors(colors: ColorConfig) {
    this.setPrimaryColor(colors.mainColor);
    this.setAccentColor(colors.peakColor);
  }

  private setPrimaryColor(color?: string) {
    this.primaryColor = color || FALLBACK_PRIMARY_COLOR;
    this.primaryColorPalette = this.computeColors(this.primaryColor);

    for (const clr of this.primaryColorPalette) {
      const key1 = `--theme-primary-${clr.name}`;
      const value1 = clr.hex;
      // const key2 = `--theme-primary-contrast-${clr.name}`;
      // const value2 = clr.darkContrast ? 'rgba(0,0,0, 0.87)' : 'white';
      document.documentElement.style.setProperty(key1, value1);
      // document.documentElement.style.setProperty(key2, value2);
    }

    this.meta.addTag({ name: 'theme-color', content: this.primaryColor }, true);
    this.meta.updateTag({ name: 'theme-color', content: this.primaryColor });
  }

  private setAccentColor(color?: string) {
    this.accentColor = color || FALLBACK_ACCENT_COLOR;
    this.accentColorPalette = this.computeColors(this.accentColor);

    for (const clr of this.accentColorPalette) {
      const key1 = `--theme-accent-${clr.name}`;
      const value1 = clr.hex;
      // const key2 = `--theme-accent-contrast-${clr.name}`;
      // const value2 = clr.darkContrast ? 'rgba(0,0,0, 0.87)' : 'white';
      document.documentElement.style.setProperty(key1, value1);
      // document.documentElement.style.setProperty(key2, value2);

      // if (clr.name === '500') {
      //   const key3 = `--theme-accent-light`;
      //   const value3 = new TinyColor(clr.hex).setAlpha(0.54).toRgbString();
      //   document.documentElement.style.setProperty(key3, value3);
      // }
    }
  }

  private setOverlayClass() {
    if (this.darkMode()) {
      document.documentElement.style.setProperty('--app-color-scheme', 'dark');
    } else {
      document.documentElement.style.setProperty('--app-color-scheme', 'light');
    }
  }

  private computeColors(hex: string): Color[] {
    return [
      this.getColorObject(new TinyColor(hex).lighten(55), '0'),
      this.getColorObject(new TinyColor(hex).lighten(45), '10'),
      this.getColorObject(new TinyColor(hex).lighten(35), '20'),
      this.getColorObject(new TinyColor(hex).lighten(30), '25'),
      this.getColorObject(new TinyColor(hex).lighten(25), '30'),
      this.getColorObject(new TinyColor(hex).lighten(20), '35'),
      this.getColorObject(new TinyColor(hex).lighten(15), '40'),
      this.getColorObject(new TinyColor(hex), '50'),
      this.getColorObject(new TinyColor(hex).darken(5), '60'),
      this.getColorObject(new TinyColor(hex).darken(10), '70'),
      this.getColorObject(new TinyColor(hex).darken(15), '80'),
      this.getColorObject(new TinyColor(hex).darken(18), '90'),
      this.getColorObject(new TinyColor(hex).darken(21), '95'),
      this.getColorObject(new TinyColor(hex).darken(24), '98'),
      this.getColorObject(new TinyColor(hex).darken(27), '99'),
      this.getColorObject(new TinyColor(hex).darken(30), '100')
    ];
  }

  private getColorObject(value: TinyColor, name: string): Color {
    const color = new TinyColor(value);
    const lightnessLimit = this.darkMode() ? 150 : 200;
    return {
      name: name,
      hex: color.toHexString(false),
      darkContrast: color.getBrightness() > lightnessLimit
      // darkContrast: c.isLight()
    };
  }
}
