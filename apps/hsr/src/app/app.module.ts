import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerModule } from '@motabass/ui-components/player';
import { SlidePanelModule } from '@motabass/ui-components/slide-panel';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, PlayerModule, SlidePanelModule, VisualsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
