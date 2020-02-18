import { Route } from '@angular/router';

export const ROUTES_CONFIG: Route[] = [
  { path: '', redirectTo: 'blog', pathMatch: 'full' },
  { path: 'audio', loadChildren: () => import('./modules/audio/audio.module').then((m) => m.AudioModule) },
  { path: '**', redirectTo: '' }
];
