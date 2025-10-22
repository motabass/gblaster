import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from './theme/theme.service';
import { UpdateService } from './update.service';
import { ShellComponent } from './shell/shell.component';

@Component({
  selector: 'mtb-root',
  imports: [ShellComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly updateService = inject(UpdateService);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.themeService.initializeTheme();

    this.iconRegistry.addSvgIconSet(this.sanitizer.bypassSecurityTrustResourceUrl('assets/icon-set.svg'));
    this.iconRegistry.addSvgIcon('logo', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/logo-monochrome.svg'));

    void this.updateService.init();
  }
}
