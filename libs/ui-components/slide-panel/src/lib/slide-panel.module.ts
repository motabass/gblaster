import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SlidePanelComponent } from './slide-panel.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule],
  declarations: [SlidePanelComponent],
  exports: [SlidePanelComponent]
})
export class SlidePanelModule {}
