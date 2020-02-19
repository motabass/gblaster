import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { PromptDialogComponent } from './prompt-dialog/prompt-dialog.component';

@NgModule({
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  declarations: [PromptDialogComponent],
  exports: [PromptDialogComponent]
})
export class DialogsModule {}
