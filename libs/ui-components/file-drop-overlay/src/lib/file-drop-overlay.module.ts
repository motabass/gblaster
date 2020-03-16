import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDropOverlayComponent } from './file-drop-overlay/file-drop-overlay.component';

@NgModule({
  imports: [CommonModule],
  exports: [FileDropOverlayComponent],
  declarations: [FileDropOverlayComponent]
})
export class FileDropOverlayModule {}
