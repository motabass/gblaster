import { Route } from '@angular/router';

export const routes: Route[] = [
  { path: '', redirectTo: 'player', pathMatch: 'full' },
  { path: 'player', loadComponent: () => import('./player/player.component') },
  {
    path: 'player/eq',
    loadComponent: () => import('./player/equalizer/equalizer.component')
  },
  {
    path: 'player/library',
    loadComponent: () => import('./player/library/library.component')
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component')
  },
  { path: '**', redirectTo: '' }
];
