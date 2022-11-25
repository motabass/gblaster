import { Component, OnInit } from '@angular/core';
import { MatLegacySlideToggleChange as MatSlideToggleChange } from '@angular/material/legacy-slide-toggle';
import { MetadataService } from '@motabass/player';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'mtb-metadata-settings',
  templateUrl: './metadata-settings.component.html',
  styleUrls: ['./metadata-settings.component.scss']
})
export class MetadataSettingsComponent implements OnInit {
  constructor(private metadataService: MetadataService, private indexedDBService: NgxIndexedDBService) {}

  ngOnInit() {}

  get useFileTags() {
    return this.metadataService.useFileTags;
  }

  get useWebTags() {
    return this.metadataService.useWebTags;
  }

  get useTagsCache() {
    return this.metadataService.useTagsCache;
  }

  onUseFileTagsChange(event: MatSlideToggleChange) {
    this.metadataService.useFileTags = event.checked;
    if (!event.checked) {
      this.metadataService.useWebTags = false;
    }
  }

  onUseWebTagsChange(event: MatSlideToggleChange) {
    this.metadataService.useWebTags = event.checked;
  }

  onUseTagsCacheChange(event: MatSlideToggleChange) {
    this.metadataService.useTagsCache = event.checked;
  }

  clearMetadataCache() {
    this.indexedDBService.clear('metatags');
  }
}
