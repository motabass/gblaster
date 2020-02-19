import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { PromptDialogComponent, PromptDialogData } from '@motabass/ui-components/dialogs';

@Injectable({
  providedIn: 'root'
})
export class UpdateService implements OnDestroy {
  constructor(private updates: SwUpdate, private dialog: MatDialog) {
    if (updates.isEnabled) {
      updates.available.subscribe((event) => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
        this.askUserForUpdate(event).then((update) => {
          if (update) {
            updates.activateUpdate().then(() => document.location.reload());
          }
        });
      });
      updates.activated.subscribe((event) => {
        console.log('old version was', event.previous);
        console.log('new version is', event.current);
      });
    }
  }

  init() {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate();
    }
  }

  ngOnDestroy(): void {
    // TODO: unsubscribe
  }

  async askUserForUpdate(event: UpdateAvailableEvent): Promise<boolean> {
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
    const update: boolean = await this.dialog
      .open(PromptDialogComponent, config)
      .afterClosed()
      .toPromise();

    return update;
  }
}
