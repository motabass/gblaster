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

    iconRegistry.addSvgIcon('volume-high', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-high.svg'));
    iconRegistry.addSvgIcon('volume-medium', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-medium.svg'));
    iconRegistry.addSvgIcon('volume-low', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-low.svg'));
    iconRegistry.addSvgIcon('volume-variant-off', sanitizer.bypassSecurityTrustResourceUrl('assets/volume-variant-off.svg'));

    if (electronService.isElectronApp) {
      console.log('Running in Electron');
      console.log(electronService.screen?.getPrimaryDisplay().accelerometerSupport);
      console.log(electronService.screen?.getPrimaryDisplay().bounds);
      console.log(electronService.screen?.getPrimaryDisplay().scaleFactor);
      console.log(electronService.ipcRenderer);
    } else {
      console.log('Running in Browser');
    }
  }
}
