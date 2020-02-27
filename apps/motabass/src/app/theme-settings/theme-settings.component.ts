import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ThemeService } from '@motabass/core/theme';

@Component({
  selector: 'mtb-theme-settings',
  templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent {
  constructor(public themeService: ThemeService) {}

  setPrimaryColor(event: any) {
    this.themeService.setPrimaryColor(event.target?.value);
  }

  setAccentColor(event: any) {
    this.themeService.setAccentColor(event.target?.value);
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
}
