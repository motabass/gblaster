import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig } from 'ngx-webstorage';
import { DBConfig, NgxIndexedDBModule, NgxIndexedDBService } from 'ngx-indexed-db';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { LoaderInterceptor } from './services/loader/loader.interceptor';
import SettingsComponent from './settings/settings.component';
import { PlayerComponent } from './player/player.component';
import { EqualizerComponent } from './player/equalizer/equalizer.component';
import { LibraryComponent } from './player/library/library.component';
import { FileLoaderService } from './player/file-loader-service/file-loader.service.abstract';
import { FileLoaderServiceFactory } from './player/file-loader-service/file-loader.service.factory';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';

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
      NgxIndexedDBModule.forRoot(dbConfig)
    ),
    {
      provide: FileLoaderService,
      useFactory: FileLoaderServiceFactory,
      deps: [NgxIndexedDBService]
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: { showDelay: 800, position: 'above', disableTooltipInteractivity: true }
    },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    provideNgxWebstorage(withNgxWebstorageConfig({ separator: '|', caseSensitive: true, prefix: 'gblaster' }), withLocalStorage()),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter(
      [
        { path: '', redirectTo: 'player', pathMatch: 'full' },
        { path: 'player', component: PlayerComponent },
        { path: 'player/eq', component: EqualizerComponent },
        { path: 'player/library', component: LibraryComponent },
        { path: 'settings', component: SettingsComponent },
        { path: '**', redirectTo: '' }
      ],
      withEnabledBlockingInitialNavigation()
    )
  ]
};
