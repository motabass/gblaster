import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from '@motabass/core/theme';
import { UpdateService } from '@motabass/core/update';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'mtb-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(
    updateService: UpdateService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    themeService: ThemeService,
    electronService: ElectronService
  ) {
    updateService.init();

    themeService.initializeTheme();

    iconRegistry.addSvgIconSet(sanitizer.bypassSecurityTrustResourceUrl('assets/icon-set.svg'));

    if (electronService.isElectronApp) {
      console.log('Running in Electron');
    } else {
      console.log('Running in Browser');
    }
  }
}
