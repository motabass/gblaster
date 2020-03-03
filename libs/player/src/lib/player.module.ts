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
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { GamepadModule } from '@motabass/helper-services/gamepad';
import { FileLoaderService } from '@motabass/player/src/lib/file-loader-service/file-loader.service.abstract';
import { FileLoaderServiceFactory } from '@motabass/player/src/lib/file-loader-service/file-loader.service.factory';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { ElectronService } from 'ngx-electron';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { BandPipe } from './equalizer/band.pipe';
import { EqualizerComponent } from './equalizer/equalizer.component';
import { ID3TagsService } from './metadata-service/id3-tags.service.abstract';
import { Id3TagsServiceFactory } from './metadata-service/id3-tags.service.factory';
import { PlayerComponent } from './player.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { TimePipe } from './time.pipe';
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
    MatSelectModule,
    GamepadModule,
    MatToolbarModule
  ],
  declarations: [PlayerComponent, PlaylistComponent, TimePipe, CoverDisplayComponent, VisualizerComponent, EqualizerComponent, BandPipe],
  providers: [
    {
      provide: ID3TagsService,
      useFactory: Id3TagsServiceFactory,
      deps: [ElectronService]
    },
    {
      provide: FileLoaderService,
      useFactory: FileLoaderServiceFactory,
      deps: [ElectronService]
    }
  ]
})
export class PlayerModule {}
