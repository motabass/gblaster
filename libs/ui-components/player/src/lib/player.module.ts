import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { PlayerComponent } from './player.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { TimePipe } from './time.pipe';
import { MetadataComponent } from './metadata/metadata.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatListModule, MatButtonModule, MatSliderModule, FlexLayoutModule, VisualsModule],
  declarations: [PlayerComponent, PlaylistComponent, TimePipe, MetadataComponent],
  exports: [PlayerComponent, MetadataComponent]
})
export class PlayerModule {}
