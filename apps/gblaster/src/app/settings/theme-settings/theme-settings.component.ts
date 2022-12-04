import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'mtb-theme-settings',
  templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent {
  constructor(public themeService: ThemeService) {}

  changeDarkMode(event: MatCheckboxChange) {
    this.themeService.darkMode = event.checked;
  }
}
