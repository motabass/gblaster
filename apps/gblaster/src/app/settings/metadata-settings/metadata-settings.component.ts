import { Component, inject } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MetadataService } from '../../player/metadata-service/metadata.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'mtb-metadata-settings',
  templateUrl: './metadata-settings.component.html',
  imports: [MatCardModule, MatSlideToggleModule, MatButtonModule]
})
export class MetadataSettingsComponent {
  metadataService = inject(MetadataService);
  private indexedDBService = inject(NgxIndexedDBService);

  onUseWebTagsChange(event: MatSlideToggleChange) {
    this.metadataService.useWebMetainfos.set(event.checked);
  }

  onUseTagsCacheChange(event: MatSlideToggleChange) {
    this.metadataService.useTagsCache.set(event.checked);
  }

  onUseTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.useTagEmbeddedPicture.set(event.checked);
  }

  onPreferTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.preferTagEmbeddedPicture.set(event.checked);
  }

  async clearMetadataCache() {
    await this.indexedDBService.clear('metatags').toPromise();
  }
}
