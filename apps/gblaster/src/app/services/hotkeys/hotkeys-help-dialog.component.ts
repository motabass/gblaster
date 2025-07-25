import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HotkeyInfo } from './hotkeys.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface HotkeysData {
  registeredHotkeys: Map<string, HotkeyInfo>;
}

@Component({
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './hotkeys-help-dialog.component.html',
  styleUrl: './hotkeys-help-dialog.component.scss'
})
export class HotkeysHelpDialogComponent {
  dialogRef = inject<MatDialogRef<HotkeysHelpDialogComponent>>(MatDialogRef);
  data = inject<HotkeysData>(MAT_DIALOG_DATA);

  get hotkeyList() {
    return [...this.data.registeredHotkeys.entries()];
  }

  close() {
    this.dialogRef.close();
  }
}
