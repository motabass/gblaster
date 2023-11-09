import { Component } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'mtb-storage-settings',
  templateUrl: './storage-settings.component.html',
  styleUrl: './storage-settings.component.scss',
  standalone: true,
  imports: [MatCardModule, MatButtonModule]
})
export class StorageSettingsComponent {
  constructor(private localStorage: LocalStorageService) {}

  clearSettingsCache() {
    this.localStorage.clear();
  }
}
