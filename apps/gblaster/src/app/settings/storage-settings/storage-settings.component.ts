import { Component, inject } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'mtb-storage-settings',
  imports: [MatCard, MatCardContent, MatButton, MatCardTitle, MatCardHeader],
  templateUrl: './storage-settings.component.html'
})
export class StorageSettingsComponent {
  private readonly localStorage = inject(LocalStorageService);

  clearSettingsCache() {
    this.localStorage.clear();
  }
}
