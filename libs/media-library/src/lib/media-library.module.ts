import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayerModule } from '@motabass/ui-components/player';
import { SlidePanelModule } from '@motabass/ui-components/slide-panel';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { MediaLibraryComponent } from './media-library.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: MediaLibraryComponent }]),
    VisualsModule,
    SlidePanelModule,
    PlayerModule
  ],
  declarations: [MediaLibraryComponent]
})
export class MediaLibraryModule {}
