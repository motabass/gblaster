import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, viewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoaderService } from '../services/loader/loader.service';
import { TitleService } from '../services/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mtb-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  imports: [MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule, MatProgressSpinnerModule, RouterOutlet]
})
export class ShellComponent {
  private breakpointObserver = inject(BreakpointObserver);
  titleService = inject(TitleService);
  loaderService = inject(LoaderService);
  private router = inject(Router);

  private isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  isHandset = toSignal(this.isHandset$, { initialValue: false });

  readonly sidenav = viewChild<MatSidenav>('drawer');

  navigateTo(route: string, skipLocationChange = false) {
    this.sidenav()?.close();
    this.router.navigate([route], { skipLocationChange: skipLocationChange });
  }
}
