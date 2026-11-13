import { Component, inject, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from './theme/theme.service';
import { UpdateService } from './update.service';
import { ShellComponent } from './shell/shell.component';
import { ICON_NAMES } from './icons';

/**
Initializes application-wide theme, icons, and service-worker updates.
*/
@Component({
  selector: 'mtb-root',
  imports: [ShellComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  readonly #updateService = inject(UpdateService);
  readonly #iconRegistry = inject(MatIconRegistry);
  readonly #sanitizer = inject(DomSanitizer);
  readonly #themeService = inject(ThemeService);

  /**
  Initializes the theme and registers application-wide SVG icons.
  */
  constructor() {
    this.#themeService.initializeTheme();

    this.registerIcons();
  }

  /**
  Checks for a service-worker update when application initialization completes.
  */
  ngOnInit(): void {
    void this.#updateService.init();
  }

  private registerIcons(): void {
    for (const name of ICON_NAMES) {
      // The URL is constructed exclusively from the static list above.
      // eslint-disable-next-line sonarjs/no-angular-bypass-sanitization
      this.#iconRegistry.addSvgIcon(name, this.#sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${name}.svg`));
    }
  }
}
