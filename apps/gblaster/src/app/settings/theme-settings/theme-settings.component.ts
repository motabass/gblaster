import { Component, inject } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { ThemeService } from '../../theme/theme.service';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

/**
Displays and updates the application's dark-mode preference.
*/
@Component({
  selector: 'mtb-theme-settings',
  imports: [MatCard, MatCardContent, MatCheckbox, MatCardTitle, MatCardHeader],
  templateUrl: './theme-settings.component.html'
})
export class ThemeSettingsComponent {
  protected readonly themeService = inject(ThemeService);

  /**
  Applies the dark-mode state selected by the user.
  @param event Checkbox change event containing the selected state.
  */
  protected changeDarkMode(event: MatCheckboxChange) {
    this.themeService.setDarkMode(event.checked);
  }
}
