import { Component, inject } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MetadataService } from '../../player/metadata-service/metadata.service';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { LibraryService } from '../../player/library/library.service';

/**
Displays controls for metadata lookup and embedded-cover preferences.
*/
@Component({
  selector: 'mtb-metadata-settings',
  imports: [MatCard, MatCardContent, MatSlideToggle, MatButton, MatCardTitle, MatCardHeader],
  templateUrl: './metadata-settings.component.html',
  styleUrl: './metadata-settings.component.scss'
})
export class MetadataSettingsComponent {
  protected readonly metadataService = inject(MetadataService);
  readonly #libraryService = inject(LibraryService);

  /**
  Updates whether remote tag and artwork lookup is enabled.
  @param event Toggle change event containing the new setting.
  */
  protected onUseWebTagsChange(event: MatSlideToggleChange) {
    this.metadataService.setUseWebMetainfos(event.checked);
  }

  /**
  Updates whether embedded tag pictures are used as cover art.
  @param event Toggle change event containing the new setting.
  */
  protected onUseTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.setUseTagEmbeddedPicture(event.checked);
  }

  /**
  Updates whether embedded pictures take precedence over remote cover art.
  @param event Toggle change event containing the new setting.
  */
  protected onPreferTagEmbeddedPicsChange(event: MatSlideToggleChange) {
    this.metadataService.setPreferTagEmbeddedPicture(event.checked);
  }

  /**
  Clears stored library metadata.
  */
  protected async clearMetadataCache() {
    await this.#libraryService.clearLibrary();
  }
}
