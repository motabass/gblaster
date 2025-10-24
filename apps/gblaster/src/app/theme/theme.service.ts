import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { FALLBACK_ACCENT_COLOR, FALLBACK_PRIMARY_COLOR } from './default-colors';
import { ColorConfig } from '../player/player.types';
import { computeColors } from './theme-helper';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly meta = inject(Meta);
  private readonly localStorageService = inject(LocalStorageService);

  readonly darkMode = signal<boolean>(
    this.localStorageService.retrieve('darkMode') ?? globalThis.matchMedia('(prefers-color-scheme: dark)').matches
  );

  readonly primaryColor = signal<string>(this.localStorageService.retrieve('primaryColor') ?? FALLBACK_PRIMARY_COLOR);

  readonly accentColor = signal<string>(this.localStorageService.retrieve('accentColor') ?? FALLBACK_ACCENT_COLOR);

  readonly primaryColorPalette = computed(() => computeColors(this.primaryColor(), this.darkMode()));
  readonly accentColorPalette = computed(() => computeColors(this.accentColor(), this.darkMode()));

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
}
