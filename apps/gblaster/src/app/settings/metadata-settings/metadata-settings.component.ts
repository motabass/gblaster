import { Component, inject } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MetadataService } from '../../player/metadata-service/metadata.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'mtb-metadata-settings',
  templateUrl: './metadata-settings.component.html',
  imports: [MatCardModule, MatSlideToggleModule, MatButtonModule]
})
export class MetadataSettingsComponent {
  metadataService = inject(MetadataService);
  private indexedDBService = inject(NgxIndexedDBService);
  private localStorageService = inject(LocalStorageService);

  onUseWebTagsChange(event: MatSlideToggleChange) {
    this.metadataService.useWebMetainfos.set(event.checked);
    this.localStorageService.store('useWebMetainfos', event.checked);
  }

  onUseTagsCacheChange(event: MatSlideToggleChange) {
    this.metadataService.useTagsCache.set(event.checked);
    this.localStorageService.store('useTagsCache', event.checked);
  }

  onUseTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.useTagEmbeddedPicture.set(event.checked);
    this.localStorageService.store('useTagEmbeddedPicture', event.checked);
  }

  onPreferTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.preferTagEmbeddedPicture.set(event.checked);
    this.localStorageService.store('preferTagEmbeddedPicture', event.checked);
  }

  async clearMetadataCache() {
    await this.indexedDBService.clear('metatags').toPromise();
  }
}
