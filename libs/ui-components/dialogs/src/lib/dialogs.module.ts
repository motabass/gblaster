import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { UpdatePromptDialogComponent } from './update-prompt-dialog/update-prompt-dialog.component';

@NgModule({
  imports: [CommonModule, MatDialogModule],
  declarations: [UpdatePromptDialogComponent],
  exports: [UpdatePromptDialogComponent]
})
export class DialogsModule {}
