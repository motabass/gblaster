import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'mtb-theme-settings',
  templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent {
  constructor(public themeService: ThemeService) {}

  setPrimaryColor(event: Event) {
    this.themeService.setPrimaryColor(event.target['value']);
  }

  setAccentColor(event: Event) {
    this.themeService.setAccentColor(event.target['value']);
  }

  changeDarkMode(event: MatCheckboxChange) {
    this.themeService.darkMode = event.checked;
  }
}
