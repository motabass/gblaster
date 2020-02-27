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
  constructor(updateService: UpdateService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, themeService: ThemeService) {
    updateService.init();

    themeService.initializeTheme();

    iconRegistry.addSvgIcon('volume-high', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-high.svg'));
    iconRegistry.addSvgIcon('volume-medium', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-medium.svg'));
    iconRegistry.addSvgIcon('volume-low', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-low.svg'));
    iconRegistry.addSvgIcon('volume-variant-off', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-variant-off.svg'));
  }
}
