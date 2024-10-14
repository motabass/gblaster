import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HotkeyInfo } from './hotkeys.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface HotkeysData {
  registeredHotkeys: Map<string, HotkeyInfo>;
}

@Component({
  selector: 'mtb-hotkeys-help-dialog',
  styleUrl: './hotkeys-help-dialog.component.scss',
  templateUrl: './hotkeys-help-dialog.component.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatListModule]
})
export class HotkeysHelpDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HotkeysHelpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HotkeysData
  ) {}

  get hotkeyList() {
    return [...this.data.registeredHotkeys.entries()];
  }

  close() {
    this.dialogRef.close();
  }
}
