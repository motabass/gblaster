import { Route } from '@angular/router';
import { PlayerComponent } from './player/player.component';
import { EqualizerComponent } from './player/equalizer/equalizer.component';
import { LibraryComponent } from './player/library/library.component';
import SettingsComponent from './settings/settings.component';

export const routes: Route[] = [
  { path: '', redirectTo: 'player', pathMatch: 'full' },
  { path: 'player', component: PlayerComponent },
  { path: 'player/eq', component: EqualizerComponent },
  { path: 'player/library', component: LibraryComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
