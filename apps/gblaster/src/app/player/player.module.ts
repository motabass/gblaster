import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatIconSizeModule } from '@motabass/material-helpers/mat-icon-size';
import { SlidePanelModule } from '@motabass/ui-components/slide-panel';
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
import { SafePipeModule } from 'safe-pipe';
import { VisualsDirective } from './visualizer/visuals/visuals.directive';
import { HotkeysModule } from '../services/hotkeys/hotkeys.module';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule } from '@angular/material/tooltip';
import { FileDropOverlayComponent } from '@motabass/ui-components/file-drop-overlay';

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
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    HotkeysModule,
    MatToolbarModule,
    MobxAngularModule,
    SlidePanelModule,
    MatIconSizeModule,
    DragDropModule,
    SafePipeModule,
    MatTooltipModule,
    FileDropOverlayComponent
  ],
  declarations: [
    PlayerComponent,
    PlaylistComponent,
    TimePipe,
    CoverDisplayComponent,
    VisualizerComponent,
    EqualizerComponent,
    BandPipe,
    EqualizerShellComponent,
    VisualsDirective
  ],
  providers: [
    {
      provide: FileLoaderService,
      useFactory: FileLoaderServiceFactory,
      deps: [NgxIndexedDBService]
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: { showDelay: 800, position: 'above', disableTooltipInteractivity: true }
    }
  ]
})
export class PlayerModule {}
