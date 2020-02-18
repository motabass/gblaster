import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlayerModule } from '@motabass/ui-components/player';
import { SlidePanelModule } from '@motabass/ui-components/slide-panel';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { AudioComponent } from './audio.component';
import { AUDIO_ROUTES } from './audio.routes';

@NgModule({
  declarations: [AudioComponent],
  imports: [CommonModule, RouterModule.forChild(AUDIO_ROUTES), SlidePanelModule, PlayerModule, VisualsModule]
})
export class AudioModule {}
