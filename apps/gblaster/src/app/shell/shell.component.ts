import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoaderService } from '../services/loader/loader.service';
import { TitleService } from '../services/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mtb-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  standalone: true,
  imports: [MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, NgIf, MatButtonModule, MatProgressSpinnerModule, RouterOutlet, AsyncPipe]
})
export class ShellComponent {
  private isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  isHandset = toSignal(this.isHandset$, { initialValue: false });

  @ViewChild('drawer') sidenav?: MatSidenav;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public titleService: TitleService,
    public loaderService: LoaderService,
    private router: Router
  ) {}

  navigateTo(route: string, skipLocationChange = false) {
    this.sidenav?.close();
    this.router.navigate([route], { skipLocationChange: skipLocationChange });
  }
}
