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

  private readonly _darkMode = signal<boolean>(
    this.localStorageService.retrieve('darkMode') ?? matchMedia('(prefers-color-scheme: dark)').matches
  );
  readonly darkMode = this._darkMode.asReadonly();

  private readonly _primaryColor = signal<string>(
    this.localStorageService.retrieve('primaryColor') ?? FALLBACK_PRIMARY_COLOR
  );
  readonly primaryColor = this._primaryColor.asReadonly();

  private readonly _accentColor = signal<string>(
    this.localStorageService.retrieve('accentColor') ?? FALLBACK_ACCENT_COLOR
  );
  readonly accentColor = this._accentColor.asReadonly();

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
    this._darkMode.set(darkMode);
  }

  setColors(colors: ColorConfig) {
    this._primaryColor.set(colors.mainColor || FALLBACK_PRIMARY_COLOR);
    this._accentColor.set(colors.peakColor || FALLBACK_ACCENT_COLOR);
  }

  setPrimaryColor(color: string) {
    this._primaryColor.set(color || FALLBACK_PRIMARY_COLOR);
  }

  setAccentColor(color: string) {
    this._accentColor.set(color || FALLBACK_ACCENT_COLOR);
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
