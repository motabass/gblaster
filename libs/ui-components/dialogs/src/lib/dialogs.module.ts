import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { PromptDialogComponent } from './prompt-dialog/prompt-dialog.component';

@NgModule({
  imports: [CommonModule, MatDialogModule],
  declarations: [PromptDialogComponent],
  exports: [PromptDialogComponent]
})
export class DialogsModule {}
