import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from './theme/theme.service';
import { UpdateService } from './update.service';
import { ShellComponent } from './shell/shell.component';

@Component({
  selector: 'mtb-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [ShellComponent]
})
export class AppComponent {
  constructor(updateService: UpdateService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, themeService: ThemeService) {
    updateService.init();

    themeService.initializeTheme();

    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('assets/icon-set.svg'));
    iconRegistry.addSvgIcon('logo', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/logo-monochrome.svg'));
  }
}
