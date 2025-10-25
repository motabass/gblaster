import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

export interface PromptDialogData {
  title: string;
  text: string;
  buttonText: string;
}

@Component({
  selector: 'mtb-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton]
})
export class PromptDialogComponent {
  data = inject<PromptDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<PromptDialogComponent>>(MatDialogRef);

  update() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
