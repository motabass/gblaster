import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VisualsComponent } from './visuals.component';

@NgModule({
  imports: [CommonModule],
  declarations: [VisualsComponent],
  exports: [VisualsComponent]
})
export class VisualsModule {
}
