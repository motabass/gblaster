import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { PlayerComponent } from './player.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatListModule, MatButtonModule, MatSliderModule, FlexLayoutModule, VisualsModule],
  declarations: [PlayerComponent],
  exports: [PlayerComponent]
})
export class PlayerModule {
}
