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
import { HotkeysModule } from '@motabass/helper-services/hotkeys';
import { FileDropOverlayModule } from '@motabass/ui-components/file-drop-overlay';
import { SlidePanelModule } from '@motabass/ui-components/slide-panel';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { MobxAngularModule } from 'mobx-angular';
import { ElectronService } from 'ngx-electron';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { BandPipe } from './equalizer/band.pipe';
import { EqualizerComponent } from './equalizer/equalizer.component';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { FileLoaderServiceFactory } from './file-loader-service/file-loader.service.factory';
import { ID3TagsService } from './metadata-service/id3-tags.service.abstract';
import { Id3TagsServiceFactory } from './metadata-service/id3-tags.service.factory';
import { PlayerComponent } from './player.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { TimePipe } from './time.pipe';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { EqualizerShellComponent } from './equalizer-shell/equalizer-shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: PlayerComponent },
      { path: 'eq', component: EqualizerShellComponent }
    ]),
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
    HotkeysModule,
    MatToolbarModule,
    MobxAngularModule,
    SlidePanelModule,
    FileDropOverlayModule
  ],
  declarations: [
    PlayerComponent,
    PlaylistComponent,
    TimePipe,
    CoverDisplayComponent,
    VisualizerComponent,
    EqualizerComponent,
    BandPipe,
    EqualizerShellComponent
  ],
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
