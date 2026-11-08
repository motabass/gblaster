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
  readonly #libraryService = inject(LibraryService);

  protected onUseWebTagsChange(event: MatSlideToggleChange) {
    this.metadataService.setUseWebMetainfos(event.checked);
  }

  protected onUseTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.setUseTagEmbeddedPicture(event.checked);
  }

  protected onPreferTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.setPreferTagEmbeddedPicture(event.checked);
  }

  protected async clearMetadataCache() {
    await this.#libraryService.clearLibrary();
  }
}
