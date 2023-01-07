import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';
import { PromptDialogComponent, PromptDialogData } from '@motabass/ui-components/dialogs';
import { firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseSubscribingClass } from '@motabass/base-components/base-subscribing-component';

@Injectable({
  providedIn: 'root'
})
export class UpdateService extends BaseSubscribingClass {
  constructor(private swUpdate: SwUpdate, private dialog: MatDialog) {
    super();
    if (swUpdate.isEnabled) {
      swUpdate.available.pipe(takeUntil(this.destroy$)).subscribe((event) => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
        this.askUserForUpdate().then((update) => {
          if (update) {
            swUpdate.activateUpdate().then(() => document.location.reload());
          }
        });
      });
      swUpdate.activated.pipe(takeUntil(this.destroy$)).subscribe((event) => {
        console.log('old version was', event.previous);
        console.log('new version is', event.current);
      });
    }
  }

  async init(): Promise<boolean | undefined> {
    if (this.swUpdate.isEnabled) {
      return this.swUpdate.checkForUpdate();
    }
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
