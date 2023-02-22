import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HotkeysHelpDialogComponent } from './hotkeys-help-dialog.component';

const DECLARATIONS = [HotkeysHelpDialogComponent];

@NgModule({
  imports: [CommonModule, MatDialogModule, MatListModule, MatButtonModule, MatIconModule, ...DECLARATIONS]
})
export class HotkeysModule {
  constructor(@Optional() @SkipSelf() parentModule: HotkeysModule) {
    if (parentModule) {
      throw new Error('MngHotkeysModule is already loaded. Import it in the AppModule only');
    }
  }
}
