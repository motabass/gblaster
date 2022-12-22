import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

export interface PromptDialogData {
  title: string;
  text: string;
  buttonText: string;
}

@Component({
  selector: 'mtb-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
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
