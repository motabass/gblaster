import { DestroyRef, inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';
import { PromptDialogComponent, PromptDialogData } from '@motabass/ui-components/dialogs';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private swUpdate = inject(SwUpdate);
  private dialog = inject(MatDialog);
  private destroRef = inject(DestroyRef);

  constructor() {
    const swUpdate = this.swUpdate;

    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates.pipe(takeUntilDestroyed(this.destroRef)).subscribe((event) => {
        switch (event.type) {
          case 'VERSION_DETECTED': {
            console.log(`Downloading new app version: ${event.version.hash}`);
            break;
          }
          case 'VERSION_READY': {
            console.log(`Current app version: ${event.currentVersion.hash}`);
            console.log(`New app version ready for use: ${event.latestVersion.hash}`);
            this.askUserForUpdate().then((update) => {
              if (update) {
                swUpdate.activateUpdate().then(() => document.location.reload());
              }
            });
            break;
          }
          case 'VERSION_INSTALLATION_FAILED': {
            console.log(`Failed to install app version '${event.version.hash}': ${event.error}`);
            break;
          }
        }
      });
    }
  }

  async init(): Promise<boolean | undefined> {
    if (this.swUpdate.isEnabled) {
      return this.swUpdate.checkForUpdate();
    }
    return;
  }

  async askUserForUpdate(): Promise<boolean> {
    const data: PromptDialogData = {
      title: 'Update verfügbar!',
      text: 'Soll das Update durchgeführt werden?',
      buttonText: 'Update'
    };

    const config: MatDialogConfig = {
      data: data,
      disableClose: true,
      closeOnNavigation: false
    };
    return firstValueFrom(this.dialog.open(PromptDialogComponent, config).afterClosed());
  }
}
