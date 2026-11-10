import { computed, effect, inject, Service, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { FALLBACK_ACCENT_COLOR, FALLBACK_PRIMARY_COLOR } from './default-colors';
import { ColorConfig } from '../player/player.types';
import { computeColors } from './theme-helper';

const DARK_MODE_PREFERENCE_KEY = 'darkModePreference';

/**
Manages persisted theme preferences and applies colors to the document.
*/
@Service()
export class ThemeService {
  readonly #meta = inject(Meta);
  readonly #localStorageService = inject(LocalStorageService);

  readonly #darkMode = signal<boolean>(
    this.#localStorageService.retrieve(DARK_MODE_PREFERENCE_KEY) ?? matchMedia('(prefers-color-scheme: dark)').matches
  );
  readonly darkMode = this.#darkMode.asReadonly();

  readonly #primaryColor = signal<string>(this.#localStorageService.retrieve('primaryColor') ?? FALLBACK_PRIMARY_COLOR);
  readonly primaryColor = this.#primaryColor.asReadonly();

  readonly #accentColor = signal<string>(this.#localStorageService.retrieve('accentColor') ?? FALLBACK_ACCENT_COLOR);
  readonly accentColor = this.#accentColor.asReadonly();

  readonly primaryColorPalette = computed(() => computeColors(this.primaryColor(), this.darkMode()));
  readonly accentColorPalette = computed(() => computeColors(this.accentColor(), this.darkMode()));

  /**
  Persists color changes and updates the document when theme state changes.
  */
  constructor() {
    effect(() => {
      this.#updateCSSProperties();
      this.#updateMetaThemeColor();
    });

    effect(() => {
      this.#localStorageService.store('primaryColor', this.primaryColor());
    });

    effect(() => {
      this.#localStorageService.store('accentColor', this.accentColor());
    });
  }

  /**
  Applies the current theme colors and browser theme-color metadata.
  */
  initializeTheme() {
    this.#updateCSSProperties();
    this.#updateMetaThemeColor();
  }

  /**
  Sets and persists the preferred color-scheme mode.
  */
  setDarkMode(isDarkMode: boolean) {
    this.#localStorageService.store(DARK_MODE_PREFERENCE_KEY, isDarkMode);
    this.#darkMode.set(isDarkMode);
  }

  /**
  Sets the primary and accent colors from a track's color configuration.
  */
  setColors(colors: ColorConfig) {
    this.#primaryColor.set(colors.mainColor || FALLBACK_PRIMARY_COLOR);
    this.#accentColor.set(colors.peakColor || FALLBACK_ACCENT_COLOR);
  }

  /**
  Sets the primary theme color, using the fallback when the value is empty.
  */
  setPrimaryColor(color: string) {
    this.#primaryColor.set(color || FALLBACK_PRIMARY_COLOR);
  }

  /**
  Sets the accent theme color, using the fallback when the value is empty.
  */
  setAccentColor(color: string) {
    this.#accentColor.set(color || FALLBACK_ACCENT_COLOR);
  }

  /**
  Writes the current color scheme and generated palettes to root CSS variables.
  */
  #updateCSSProperties() {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--app-color-scheme', this.darkMode() ? 'dark' : 'light');

    for (const color of this.primaryColorPalette()) {
      rootStyle.setProperty(`--theme-primary-${color.name}`, color.hex);
    }

    for (const color of this.accentColorPalette()) {
      rootStyle.setProperty(`--theme-accent-${color.name}`, color.hex);
    }
  }

  /**
  Updates the browser's theme-color metadata with the current primary color.
  */
  #updateMetaThemeColor() {
    this.#meta.updateTag({ name: 'theme-color', content: this.primaryColor() });
  }
}
