import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mtb-update-prompt-dialog',
  templateUrl: './update-prompt-dialog.component.html',
  styleUrls: ['./update-prompt-dialog.component.scss']
})
export class UpdatePromptDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UpdatePromptDialogComponent>) {}

  ngOnInit(): void {}

  update() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
