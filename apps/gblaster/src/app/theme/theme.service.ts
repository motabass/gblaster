import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Colord, colord } from 'colord';
import { LocalStorageService } from 'ngx-webstorage';
import { ThemeColor } from './theme.types';
import { FALLBACK_ACCENT_COLOR, FALLBACK_PRIMARY_COLOR } from './default-colors';
import { ColorConfig } from '../player/player.types';

interface ColorVariant {
  suffix: string;
  lightenFactor?: number;
  darkenFactor?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly meta = inject(Meta);
  private readonly localStorageService = inject(LocalStorageService);

  private readonly COLOR_VARIANTS: ColorVariant[] = [
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

  readonly darkMode = signal<boolean>(
    this.localStorageService.retrieve('darkMode') ?? globalThis.matchMedia('(prefers-color-scheme: dark)').matches
  );

  readonly primaryColor = signal<string>(this.localStorageService.retrieve('primaryColor') ?? FALLBACK_PRIMARY_COLOR);

  readonly accentColor = signal<string>(this.localStorageService.retrieve('accentColor') ?? FALLBACK_ACCENT_COLOR);

  readonly primaryColorPalette = computed(() => this.computeColors(this.primaryColor()));
  readonly accentColorPalette = computed(() => this.computeColors(this.accentColor()));

  constructor() {
    // Automatische Updates bei Änderungen
    effect(() => {
      this.updateCSSProperties();
      this.updateMetaThemeColor();
    });

    effect(() => {
      this.localStorageService.store('darkMode', this.darkMode());
    });

    effect(() => {
      this.localStorageService.store('primaryColor', this.primaryColor());
    });

    effect(() => {
      this.localStorageService.store('accentColor', this.accentColor());
    });
  }

  initializeTheme() {
    this.updateCSSProperties();
    this.updateMetaThemeColor();
  }

  setDarkMode(darkMode: boolean) {
    this.darkMode.set(darkMode);
  }

  setColors(colors: ColorConfig) {
    this.primaryColor.set(colors.mainColor || FALLBACK_PRIMARY_COLOR);
    this.accentColor.set(colors.peakColor || FALLBACK_ACCENT_COLOR);
  }

  setPrimaryColor(color: string) {
    this.primaryColor.set(color || FALLBACK_PRIMARY_COLOR);
  }

  setAccentColor(color: string) {
    this.accentColor.set(color || FALLBACK_ACCENT_COLOR);
  }

  private updateCSSProperties() {
    const variables: string[] = [`--app-color-scheme: ${this.darkMode() ? 'dark' : 'light'}`];

    for (const color of this.primaryColorPalette()) {
      variables.push(`--theme-primary-${color.name}: ${color.hex}`);
    }

    for (const color of this.accentColorPalette()) {
      variables.push(`--theme-accent-${color.name}: ${color.hex}`);
    }

    document.documentElement.style.cssText += variables.join(';');
  }

  private updateMetaThemeColor() {
    this.meta.updateTag({ name: 'theme-color', content: this.primaryColor() });
  }

  private computeColors(hex: string): ThemeColor[] {
    const baseColor = colord(hex);

    return this.COLOR_VARIANTS.map((variant) => {
      let color = baseColor;

      if (variant.lightenFactor) {
        color = baseColor.lighten(variant.lightenFactor);
      } else if (variant.darkenFactor) {
        color = baseColor.darken(variant.darkenFactor);
      }

      return this.getThemeColor(color, variant.suffix);
    });
  }

  private getThemeColor(color: Colord, name: string): ThemeColor {
    const lightnessLimit = this.darkMode() ? 150 : 200;
    return {
      name,
      hex: color.toHex(),
      darkContrast: color.brightness() > lightnessLimit
    };
  }
}
