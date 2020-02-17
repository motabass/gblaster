import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VisualsDirective } from './visuals.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [VisualsDirective],
  exports: [VisualsDirective]
})
export class VisualsModule {}
