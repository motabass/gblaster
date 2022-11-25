import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { HotkeyInfo } from './hotkeys.service';

export interface HotkeysData {
  registeredHotkeys: Map<string, HotkeyInfo>;
}

@Component({
  selector: 'mtb-hotkeys-help-dialog',
  styleUrls: ['./hotkeys-help-dialog.component.scss'],
  templateUrl: './hotkeys-help-dialog.component.html'
})
export class HotkeysHelpDialogComponent {
  constructor(public dialogRef: MatDialogRef<HotkeysHelpDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: HotkeysData) {}

  get hotkeyList() {
    return Array.from(this.data.registeredHotkeys.entries());
  }

  close() {
    this.dialogRef.close();
  }
}
