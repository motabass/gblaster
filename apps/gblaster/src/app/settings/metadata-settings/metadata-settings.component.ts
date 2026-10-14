import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MetadataService } from '../../player/metadata-service/metadata.service';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { LibraryService } from '../../player/library/library.service';

@Component({
  selector: 'mtb-metadata-settings',
  imports: [MatCard, MatCardContent, MatSlideToggle, MatButton, MatCardTitle, MatCardHeader],
  templateUrl: './metadata-settings.component.html',
  styleUrl: './metadata-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataSettingsComponent {
  protected readonly metadataService = inject(MetadataService);
  private readonly libraryService = inject(LibraryService);

  onUseWebTagsChange(event: MatSlideToggleChange) {
    this.metadataService.setUseWebMetainfos(event.checked);
  }

  onUseTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.setUseTagEmbeddedPicture(event.checked);
  }

  onPreferTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.setPreferTagEmbeddedPicture(event.checked);
  }

  async clearMetadataCache() {
    await this.libraryService.clearLibrary();
  }
}
