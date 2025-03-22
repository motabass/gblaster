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
import { FileDropOverlayComponent } from '@motabass/ui-components/file-drop-overlay';
import { PlayerService } from '../player/player.service';
import { ALLOWED_MIMETYPES } from '../player/file-loader-service/file-loader.helpers';
import { PlayerToolbarComponent } from '../player/player-toolbar/player-toolbar.component';

@Component({
  selector: 'mtb-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterOutlet,
    FileDropOverlayComponent,
    PlayerToolbarComponent
  ]
})
export class ShellComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private playerService = inject(PlayerService);
  private router = inject(Router);
  titleService = inject(TitleService);
  loaderService = inject(LoaderService);

  readonly ALLOWED_TYPES = ALLOWED_MIMETYPES;

  private isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  readonly isHandset = toSignal(this.isHandset$, { initialValue: false });

  readonly sidenav = viewChild<MatSidenav>('drawer');

  navigateTo(route: string, skipLocationChange = false) {
    this.sidenav()?.close();
    this.router.navigate([route], { skipLocationChange: skipLocationChange });
  }

  async onFilesDropped(files: File[]) {
    return this.playerService.addFilesToPlaylist(...files.map((file) => ({ file })));
  }
}
