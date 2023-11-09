import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoaderService } from '../services/loader/loader.service';
import { TitleService } from '../services/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'mtb-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  standalone: true,
  imports: [MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, NgIf, MatButtonModule, MatProgressSpinnerModule, RouterOutlet, AsyncPipe]
})
export class ShellComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  @ViewChild('drawer') sidenav?: MatSidenav;

  isLoading: Subject<boolean> = this.loaderService.isLoading;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private titleService: TitleService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  get title(): Observable<string> {
    return this.titleService.title;
  }

  navigateTo(route: string, skipLocationChange = false) {
    this.sidenav?.close();
    this.router.navigate([route], { skipLocationChange: skipLocationChange });
  }
}
