import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { HotkeysHelpDialogComponent } from './hotkeys-help-dialog.component';

const DECLARATIONS = [HotkeysHelpDialogComponent];

@NgModule({
  imports: [CommonModule, MatDialogModule, MatListModule, MatButtonModule, MatIconModule],
  declarations: DECLARATIONS
})
export class HotkeysModule {
  constructor(@Optional() @SkipSelf() parentModule: HotkeysModule) {
    if (parentModule) {
      throw new Error('MngHotkeysModule is already loaded. Import it in the AppModule only');
    }
  }
}
