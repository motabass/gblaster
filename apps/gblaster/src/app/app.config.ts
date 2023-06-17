import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { LoaderInterceptor } from './services/loader/loader.interceptor';

const dbConfig: DBConfig = {
  name: 'metadataCache',
  version: 2,
  objectStoresMeta: [
    {
      store: 'metatags',
      storeConfig: { keyPath: 'crc', autoIncrement: false },
      storeSchema: [
        { name: 'crc', keypath: 'crc', options: { unique: true } },
        { name: 'artist', keypath: 'artist', options: { unique: false } },
        { name: 'title', keypath: 'title', options: { unique: false } },
        { name: 'album', keypath: 'album', options: { unique: false } }
      ]
    },
    {
      store: 'dirHandle',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [{ name: 'handle', keypath: 'handle', options: { unique: false } }]
    }
  ]
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
      NgxWebstorageModule.forRoot(),
      NgxIndexedDBModule.forRoot(dbConfig),
      MatSidenavModule,
      MatToolbarModule,
      MatListModule,
      MatIconModule,
      MatButtonModule,
      MatProgressSpinnerModule,
      MatDialogModule
    ),
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter(
      [
        { path: '', redirectTo: 'player', pathMatch: 'full' },
        { path: 'player', loadChildren: () => import('./player/player.module') },
        { path: 'settings', loadChildren: () => import('./settings/settings.module') },
        { path: '**', redirectTo: '' }
      ],
      withEnabledBlockingInitialNavigation()
    )
  ]
};
