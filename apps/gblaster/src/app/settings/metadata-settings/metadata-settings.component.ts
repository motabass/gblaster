import { Component, inject } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MetadataService } from '../../player/metadata-service/metadata.service';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { LocalStorageService } from 'ngx-webstorage';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'mtb-metadata-settings',
  imports: [MatCard, MatCardContent, MatSlideToggle, MatButton, MatCardTitle, MatCardHeader],
  templateUrl: './metadata-settings.component.html',
  styleUrl: './metadata-settings.component.scss'
})
export class MetadataSettingsComponent {
  protected readonly metadataService = inject(MetadataService);
  private readonly indexedDBService = inject(NgxIndexedDBService);
  private readonly localStorageService = inject(LocalStorageService);

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
    await firstValueFrom(this.indexedDBService.clear('library'));
  }
}
