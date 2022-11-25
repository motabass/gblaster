import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { GamepadModule } from '@motabass/helper-services/gamepad';
import { HotkeysModule } from '@motabass/helper-services/hotkeys';
import { WakelockModule } from '@motabass/helper-services/wakelock';
import { MatIconSizeModule } from '@motabass/material-helpers/mat-icon-size';
import { FileDropOverlayModule } from '@motabass/ui-components/file-drop-overlay';
import { SlidePanelModule } from '@motabass/ui-components/slide-panel';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { MobxAngularModule } from 'mobx-angular';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { BandPipe } from './equalizer/band.pipe';
import { EqualizerComponent } from './equalizer/equalizer.component';
import { FileLoaderService } from './file-loader-service/file-loader.service.abstract';
import { FileLoaderServiceFactory } from './file-loader-service/file-loader.service.factory';

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
    FlexModule,
    VisualsModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    GamepadModule,
    HotkeysModule,
    MatToolbarModule,
    MobxAngularModule,
    SlidePanelModule,
    FileDropOverlayModule,
    WakelockModule,
    MatIconSizeModule,
    DragDropModule
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
      provide: FileLoaderService,
      useFactory: FileLoaderServiceFactory,
      deps: [NgxIndexedDBService]
    }
  ]
})
export class PlayerModule {}
