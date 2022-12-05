import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoaderService } from '../services/loader/loader.service';
import { TitleService } from '../services/title.service';

@Component({
  selector: 'mtb-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
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
