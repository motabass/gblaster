import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig } from 'ngx-webstorage';
import { DBConfig, NgxIndexedDBService, provideIndexedDb } from 'ngx-indexed-db';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { LoaderInterceptor } from './services/loader/loader.interceptor';
import { FileLoaderService } from './player/file-loader-service/file-loader.service.abstract';
import { FileLoaderServiceFactory } from './player/file-loader-service/file-loader.service.factory';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { routes } from './app.routes';

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
    provideIndexedDb(dbConfig),
    provideServiceWorker('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    provideNgxWebstorage(withNgxWebstorageConfig({ separator: '|', caseSensitive: true, prefix: 'gblaster' }), withLocalStorage()),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    {
      provide: FileLoaderService,
      useFactory: FileLoaderServiceFactory,
      deps: [NgxIndexedDBService]
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: { showDelay: 800, position: 'above', disableTooltipInteractivity: true }
    },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ]
};
