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
  private metadataService = inject(MetadataService);
  private indexedDBService = inject(NgxIndexedDBService);

  get useWebTags() {
    return this.metadataService.useWebMetainfos;
  }

  get useTagsCache() {
    return this.metadataService.useTagsCache;
  }

  onUseWebTagsChange(event: MatSlideToggleChange) {
    this.metadataService.useWebMetainfos = event.checked;
  }

  onUseTagsCacheChange(event: MatSlideToggleChange) {
    this.metadataService.useTagsCache = event.checked;
  }

  async clearMetadataCache() {
    await this.indexedDBService.clear('metatags').toPromise();
  }

  get useTagEmbeddedPics(): boolean {
    return this.metadataService.useTagEmbeddedPicture;
  }

  onUseTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.useTagEmbeddedPicture = event.checked;
  }

  get preferTagEmbeddedPics(): boolean {
    return this.metadataService.preferTagEmbeddedPicture;
  }

  onPreferTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.preferTagEmbeddedPicture = event.checked;
  }
}
