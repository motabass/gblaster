import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { PlayerComponent } from './player.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { TimePipe } from './time.pipe';
import { MetadataComponent } from './metadata/metadata.component';
import { VisualizerComponent } from './visualizer/visualizer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: PlayerComponent }]),
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatSliderModule,
    FlexLayoutModule,
    VisualsModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule
  ],
  declarations: [PlayerComponent, PlaylistComponent, TimePipe, MetadataComponent, VisualizerComponent]
})
export class PlayerModule {}
