import { Component } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'mtb-storage-settings',
  templateUrl: './storage-settings.component.html',
  styleUrls: ['./storage-settings.component.scss']
})
export class StorageSettingsComponent {
  constructor(private localStorage: LocalStorageService, private indexedDBService: NgxIndexedDBService) {}

  clearSettingsCache() {
    this.localStorage.clear();
  }

  clearMetadataCache() {
    this.indexedDBService.clear('metatags');
  }
}
