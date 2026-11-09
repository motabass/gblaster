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
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton],
  templateUrl: './prompt-dialog.component.html'
})
export class PromptDialogComponent {
  protected data = inject<PromptDialogData>(MAT_DIALOG_DATA);
  protected dialogRef = inject<MatDialogRef<PromptDialogComponent>>(MatDialogRef);

  protected update() {
    this.dialogRef.close(true);
  }

  protected cancel() {
    this.dialogRef.close(false);
  }
}
