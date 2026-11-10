import { Component, inject, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from './theme/theme.service';
import { UpdateService } from './update.service';
import { ShellComponent } from './shell/shell.component';

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
   * Initializes the theme and registers application-wide SVG icons.
   */
  constructor() {
    this.#themeService.initializeTheme();

    this.#iconRegistry.addSvgIconSet(this.#sanitizer.bypassSecurityTrustResourceUrl('assets/icon-set.svg'));
    this.#iconRegistry.addSvgIcon(
      'logo',
      this.#sanitizer.bypassSecurityTrustResourceUrl('assets/icons/logo-monochrome.svg')
    );
  }

  /**
  Checks for a service-worker update when application initialization completes.
  */
  ngOnInit(): void {
    void this.#updateService.init();
  }
}
