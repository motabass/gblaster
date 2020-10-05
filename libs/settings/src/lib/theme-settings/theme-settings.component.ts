import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ThemeService } from '@motabass/core/theme';

@Component({
  selector: 'mtb-theme-settings',
  templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent {
  constructor(public themeService: ThemeService) {}

  get coverArtColors(): boolean {
    return this.themeService.coverArtColors;
  }

  setPrimaryColor(event: string) {
    this.themeService.setPrimaryColor(event);
  }

  setAccentColor(event: string) {
    this.themeService.setAccentColor(event);
  }

  changeDarkMode(event: MatCheckboxChange) {
    this.themeService.darkMode = event.checked;
  }

  colorPickerClosed(event: any) {
    // must be called to make clickOut work
  }

  get colorSuggestions(): string[] {
    return ['#ffffff', '#000000'];
  }

  onCoverArtColorsChange(event: MatSlideToggleChange) {
    this.themeService.setCoverArtColors(event.checked);
  }
}
