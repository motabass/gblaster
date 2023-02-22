import { Component } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ThemeService } from '../../theme/theme.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'mtb-theme-settings',
  templateUrl: './theme-settings.component.html',
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule]
})
export class ThemeSettingsComponent {
  constructor(public themeService: ThemeService) {}

  changeDarkMode(event: MatCheckboxChange) {
    this.themeService.darkMode = event.checked;
  }
}
