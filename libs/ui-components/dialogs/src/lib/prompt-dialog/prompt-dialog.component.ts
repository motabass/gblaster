import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface PromptDialogData {
  title: string;
  text: string;
  buttonText: string;
}

@Component({
  selector: 'mtb-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  imports: [MatDialogModule, MatButtonModule]
})
export class PromptDialogComponent implements OnInit {
  data = inject<PromptDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<PromptDialogComponent>>(MatDialogRef);

  ngOnInit(): void {}

  update() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
