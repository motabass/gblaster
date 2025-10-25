import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HotkeyInfo } from './hotkeys.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

export interface HotkeysData {
  registeredHotkeys: Map<string, HotkeyInfo>;
}

@Component({
  imports: [MatDialogTitle, MatDialogContent, MatIconButton, MatIcon],
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
