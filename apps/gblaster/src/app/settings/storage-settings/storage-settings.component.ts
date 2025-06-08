import { Component, inject } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'mtb-storage-settings',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './storage-settings.component.html'
})
export class StorageSettingsComponent {
  private localStorage = inject(LocalStorageService);

  clearSettingsCache() {
    this.localStorage.clear();
  }
}
