import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PromptDialogData {
  title: string;
  text: string;
  buttonText: string;
}

@Component({
  selector: 'mtb-prompt-dialog',
  templateUrl: './prompt-dialog.component.html'
})
export class PromptDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PromptDialogData, public dialogRef: MatDialogRef<PromptDialogComponent>) {}

  ngOnInit(): void {}

  update() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
