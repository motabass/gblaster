import { Component, inject } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'mtb-storage-settings',
  templateUrl: './storage-settings.component.html',
  imports: [MatCardModule, MatButtonModule]
})
export class StorageSettingsComponent {
  private localStorage = inject(LocalStorageService);

  clearSettingsCache() {
    this.localStorage.clear();
  }
}
