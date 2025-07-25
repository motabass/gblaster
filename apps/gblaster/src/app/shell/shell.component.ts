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
import { ALLOWED_MIMETYPES, FileData } from '../player/file-loader-service/file-loader.helpers';
import { PlayerToolbarComponent } from '../player/player-toolbar/player-toolbar.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MetadataService } from '../player/metadata-service/metadata.service';

@Component({
  selector: 'mtb-shell',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterOutlet,
    FileDropOverlayComponent,
    PlayerToolbarComponent,
    MatProgressBar
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  protected readonly titleService = inject(TitleService);
  protected readonly loaderService = inject(LoaderService);
  protected readonly playerService = inject(PlayerService);
  protected readonly metadataService = inject(MetadataService);

  protected readonly ALLOWED_TYPES = ALLOWED_MIMETYPES;

  private readonly isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  protected readonly isHandset = toSignal(this.isHandset$, { initialValue: false });

  private readonly sidenav = viewChild<MatSidenav>('drawer');

  navigateTo(route: string, skipLocationChange = false) {
    this.sidenav()?.close();
    this.router.navigate([route], { skipLocationChange: skipLocationChange });
  }

  async onFilesDropped(files: File[]) {
    return this.playerService.addFilesToPlaylist(...files.map((file) => ({ file })));
  }

  async onFileHandlesDropped(files: FileSystemFileHandle[]) {
    const fileData: FileData[] = [];
    for (const fileHandle of files) {
      const file = await fileHandle.getFile();
      fileData.push({ file, fileHandle });
    }

    return this.playerService.addFilesToPlaylist(...fileData);
  }
}
