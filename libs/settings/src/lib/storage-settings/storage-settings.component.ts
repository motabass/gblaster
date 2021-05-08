import { Component } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'mtb-storage-settings',
  templateUrl: './storage-settings.component.html',
  styleUrls: ['./storage-settings.component.scss']
})
export class StorageSettingsComponent {
  constructor(private localStorage: LocalStorageService) {}

  clearSettingsCache() {
    this.localStorage.clear();
  }
}
