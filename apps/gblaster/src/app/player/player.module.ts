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
import { SafePipeModule } from 'safe-pipe';
import { VisualsDirective } from './visualizer/visuals/visuals.directive';
import { HotkeysModule } from '../services/hotkeys/hotkeys.module';
import {
  MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS as MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatLegacyTooltipModule as MatTooltipModule
} from '@angular/material/legacy-tooltip';
import { FileDropOverlayComponent } from '@motabass/ui-components/file-drop-overlay';
import { MatIconSizeModule } from '@motabass/material-helpers/mat-icon-size';
import { LibraryComponent } from './library/library.component';
import { NgArrayPipesModule } from 'ngx-pipes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: PlayerComponent },
      { path: 'eq', component: EqualizerComponent },
      { path: 'library', component: LibraryComponent }
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
    FileDropOverlayComponent,
    NgArrayPipesModule
  ],
  declarations: [
    PlayerComponent,
    PlaylistComponent,
    TimePipe,
    CoverDisplayComponent,
    VisualizerComponent,
    EqualizerComponent,
    BandPipe,
    VisualsDirective,
    LibraryComponent
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
