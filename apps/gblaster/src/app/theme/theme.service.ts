import { inject, Injectable, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Colord, colord } from 'colord';
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

  primaryColor = FALLBACK_PRIMARY_COLOR;

  accentColor = FALLBACK_ACCENT_COLOR;

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
      document.documentElement.style.setProperty(`--theme-primary-${clr.name}`, clr.hex);
    }

    this.meta.addTag({ name: 'theme-color', content: this.primaryColor }, true);
    this.meta.updateTag({ name: 'theme-color', content: this.primaryColor });
  }

  private setAccentColor(color?: string) {
    this.accentColor = color || FALLBACK_ACCENT_COLOR;
    this.accentColorPalette = this.computeColors(this.accentColor);

    for (const clr of this.accentColorPalette) {
      document.documentElement.style.setProperty(`--theme-accent-${clr.name}`, clr.hex);
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
    const color = colord(hex);
    return [
      this.getColorObject(color.lighten(0.55), '0'),
      this.getColorObject(color.lighten(0.45), '10'),
      this.getColorObject(color.lighten(0.35), '20'),
      this.getColorObject(color.lighten(0.3), '25'),
      this.getColorObject(color.lighten(0.25), '30'),
      this.getColorObject(color.lighten(0.2), '35'),
      this.getColorObject(color.lighten(0.15), '40'),
      this.getColorObject(color, '50'),
      this.getColorObject(color.darken(0.5), '60'),
      this.getColorObject(color.darken(0.1), '70'),
      this.getColorObject(color.darken(0.15), '80'),
      this.getColorObject(color.darken(0.18), '90'),
      this.getColorObject(color.darken(0.21), '95'),
      this.getColorObject(color.darken(0.24), '98'),
      this.getColorObject(color.darken(0.27), '99'),
      this.getColorObject(color.darken(0.3), '100')
    ];
  }

  private getColorObject(color: Colord, name: string): Color {
    const lightnessLimit = this.darkMode() ? 150 : 200;
    return {
      name: name,
      hex: color.toHex(),
      darkContrast: color.brightness() > lightnessLimit
      // darkContrast: c.isLight()
    };
  }
}
