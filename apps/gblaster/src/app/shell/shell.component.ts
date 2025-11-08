import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, viewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoaderService } from '../services/loader/loader.service';
import { TitleService } from '../services/title.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconButton } from '@angular/material/button';
import { MatListItem, MatListItemIcon, MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { toSignal } from '@angular/core/rxjs-interop';
import { FileDropOverlayComponent } from '@motabass/ui-components/file-drop-overlay';
import { PlayerService } from '../player/player.service';
import { ALLOWED_MIMETYPES, FileData } from '../player/file-loader-service/file-loader.helpers';
import { PlayerToolbarComponent } from '../player/player-toolbar/player-toolbar.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MetadataService } from '../player/metadata-service/metadata.service';
import { ProgressService } from '../player/metadata-service/progress.service';

@Component({
  selector: 'mtb-shell',
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatToolbar,
    MatIcon,
    MatNavList,
    MatListItem,
    MatIconButton,
    MatProgressSpinner,
    RouterOutlet,
    FileDropOverlayComponent,
    PlayerToolbarComponent,
    MatProgressBar,
    MatListItemIcon
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
  protected readonly progressService = inject(ProgressService);

  protected readonly ALLOWED_TYPES = ALLOWED_MIMETYPES;

  private readonly isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  protected readonly isHandset = toSignal(this.isHandset$, {
    initialValue: false
  });

  private readonly sidenav = viewChild.required<MatSidenav>('drawer');

  navigateTo(route: string, skipLocationChange = false) {
    void this.sidenav().close();
    void this.router.navigate([route], {
      skipLocationChange: skipLocationChange
    });
  }

  async onFilesDropped(files: File[]) {
    const fileData = files.map((file) => ({ file }));
    // Just process files and add to library, don't add to playlist
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars, sonarjs/no-dead-store
    for await (const track of this.metadataService.addFilesToLibrary(fileData)) {
      this.playerService.addTrackToPlaylist(track);
    }
  }

  async onFileHandlesDropped(files: FileSystemFileHandle[]) {
    const fileData: FileData[] = [];
    for (const fileHandle of files) {
      const file = await fileHandle.getFile();
      fileData.push({ file, fileHandle });
    }

    // Just process files and add to library, don't add to playlist
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars, sonarjs/no-dead-store
    for await (const track of this.metadataService.addFilesToLibrary(fileData)) {
      // Track is saved to library in addFilesToLibrary
    }
  }
}
