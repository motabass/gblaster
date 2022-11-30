import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HotkeysHelpDialogComponent } from './hotkeys-help-dialog.component';

const DECLARATIONS = [HotkeysHelpDialogComponent];

@NgModule({
  imports: [CommonModule, FlexModule, MatDialogModule, MatListModule, MatButtonModule, MatIconModule],
  declarations: DECLARATIONS
})
export class HotkeysModule {
  constructor(@Optional() @SkipSelf() parentModule: HotkeysModule) {
    if (parentModule) {
      throw new Error('MngHotkeysModule is already loaded. Import it in the AppModule only');
    }
  }
}
