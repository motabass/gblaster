import { Component, inject } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ThemeService } from '../../theme/theme.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'mtb-theme-settings',
  imports: [MatCardModule, MatCheckboxModule],
  templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent {
  protected readonly themeService = inject(ThemeService);

  changeDarkMode(event: MatCheckboxChange) {
    this.themeService.setDarkMode(event.checked);
  }
}
