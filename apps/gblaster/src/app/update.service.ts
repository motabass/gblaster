import { DestroyRef, inject, Service } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';
import { PromptDialogComponent, PromptDialogData } from '@motabass/ui-components/dialogs';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
Checks for service-worker updates and prompts the user before activating them.
*/
@Service()
export class UpdateService {
  readonly #swUpdate = inject(SwUpdate);
  readonly #dialog = inject(MatDialog);
  readonly #destroyRef = inject(DestroyRef);
  #isInitialized = false;

  /**
  Initializes update notifications once and checks for an available update.
  */
  async init(): Promise<boolean> {
    if (!this.#swUpdate.isEnabled) {
      return false;
    }

    if (!this.#isInitialized) {
      this.#setupUpdateListener();
      this.#isInitialized = true;
    }

    return this.#swUpdate.checkForUpdate();
  }

  /**
  Subscribes to service-worker version events until this service is destroyed.
  */
  #setupUpdateListener(): void {
    this.#swUpdate.versionUpdates.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((event) => {
      switch (event.type) {
        case 'VERSION_DETECTED': {
          console.log(`Downloading new app version: ${event.version.hash}`);
          break;
        }
        case 'VERSION_READY': {
          console.log(`Current app version: ${event.currentVersion.hash}`);
          console.log(`New app version ready for use: ${event.latestVersion.hash}`);
          void this.#handleVersionReady();
          break;
        }
        case 'VERSION_INSTALLATION_FAILED': {
          console.log(`Failed to install app version '${event.version.hash}': ${event.error}`);
          break;
        }
      }
    });
  }

  /**
  Prompts for a ready update and reloads the page after activation.
  */
  async #handleVersionReady(): Promise<void> {
    try {
      const shouldUpdate = await this.askUserForUpdate();
      if (shouldUpdate) {
        await this.#swUpdate.activateUpdate();
        document.location.reload();
      }
    } catch (error) {
      console.error('Error during update process:', error);
    }
  }

  /**
  Opens the update confirmation dialog and resolves to the user's choice.
  */
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

    return firstValueFrom(this.#dialog.open(PromptDialogComponent, config).afterClosed());
  }
}
