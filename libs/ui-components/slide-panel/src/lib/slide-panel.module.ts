import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SlidePanelComponent } from './slide-panel.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  declarations: [SlidePanelComponent],
  exports: [SlidePanelComponent]
})
export class SlidePanelModule {}
