import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSizeDirective } from './icon-size.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [IconSizeDirective],
  exports: [IconSizeDirective]
})
export class MatIconSizeModule {}
