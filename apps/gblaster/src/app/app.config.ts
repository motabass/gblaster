import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig } from 'ngx-webstorage';
import { NgxIndexedDBService, provideIndexedDb } from 'ngx-indexed-db';
import { provideRouter, withEnabledBlockingInitialNavigation, withViewTransitions } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { LoaderInterceptor } from './services/loader/loader.interceptor';
import { FileLoaderService } from './player/file-loader-service/file-loader.service.abstract';
import { FileLoaderServiceFactory } from './player/file-loader-service/file-loader.service.factory';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { routes } from './app.routes';
import { gamepadServiceFactory } from './services/gamepad/gamepad.service.factory';
import { GamepadService } from './services/gamepad/gamepad.service';
import { HotkeysService } from './services/hotkeys/hotkeys.service';
import { hotkeysServiceFactory } from './services/hotkeys/hotkeys.service.factory';
import { WakelockService } from './services/wakelock.service';
import { wakelockServiceFactory } from './services/wakelock.service.factory';
import { mediaSessionServiceFactory } from './services/media-session/media-session.service.factory';
import { MediaSessionService } from './services/media-session/media-session.service';
import { databaseConfig } from './idexed-db-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideIndexedDb(databaseConfig),
    provideServiceWorker('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    provideNgxWebstorage(withNgxWebstorageConfig({ separator: '|', caseSensitive: true, prefix: 'gblaster' }), withLocalStorage()),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter(routes, withEnabledBlockingInitialNavigation(), withViewTransitions()),
    {
      provide: FileLoaderService,
      useFactory: FileLoaderServiceFactory,
      deps: [NgxIndexedDBService]
    },
    { provide: GamepadService, useFactory: gamepadServiceFactory },
    { provide: HotkeysService, useFactory: hotkeysServiceFactory },
    { provide: WakelockService, useFactory: wakelockServiceFactory },
    { provide: MediaSessionService, useFactory: mediaSessionServiceFactory },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: { showDelay: 800, position: 'above', disableTooltipInteractivity: true }
    },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ]
};
