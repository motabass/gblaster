import { Component, inject } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

/**
Provides controls for clearing persisted application settings.
*/
@Component({
  selector: 'mtb-storage-settings',
  imports: [MatCard, MatCardContent, MatButton, MatCardTitle, MatCardHeader],
  templateUrl: './storage-settings.component.html'
})
export class StorageSettingsComponent {
  readonly #localStorage = inject(LocalStorageService);

  /**
  Clears all values managed by the local storage service.
  */
  protected clearSettingsCache() {
    this.#localStorage.clear();
  }
}
