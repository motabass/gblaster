import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from './theme/theme.service';
import { UpdateService } from './update.service';
import { ShellComponent } from './shell/shell.component';

@Component({
  selector: 'mtb-root',
  templateUrl: './app.component.html',
  imports: [ShellComponent]
})
export class AppComponent {
  constructor() {
    const updateService = inject(UpdateService);
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    const themeService = inject(ThemeService);

    updateService.init();

    themeService.initializeTheme();

    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('assets/icon-set.svg'));
    iconRegistry.addSvgIcon('logo', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/logo-monochrome.svg'));
  }
}
