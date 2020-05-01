import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from '@motabass/core/theme';
import { UpdateService } from '@motabass/core/update';

@Component({
  selector: 'mtb-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(
    updateService: UpdateService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    themeService: ThemeService
  ) {
    updateService.init();

    themeService.initializeTheme();

    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('assets/icon-set.svg'));
    iconRegistry.addSvgIcon('logo', sanitizer.bypassSecurityTrustResourceUrl('assets/logos/icon.svg'), { viewBox: '0 0 48 48' });
  }
}
