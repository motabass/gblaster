import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig } from 'ngx-webstorage';
import { provideIndexedDb } from 'ngx-indexed-db';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { loaderInterceptor } from './services/loader/loader.interceptor';
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
import { databaseConfig } from './indexed-db-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideIndexedDb(databaseConfig),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately',
      type: 'module'
    }),
    provideNgxWebstorage(
      withNgxWebstorageConfig({
        separator: '|',
        caseSensitive: true,
        prefix: 'gblaster'
      }),
      withLocalStorage()
    ),
    provideHttpClient(withInterceptors([loaderInterceptor]), withFetch()),
    provideRouter(routes, withViewTransitions()),
    { provide: GamepadService, useFactory: gamepadServiceFactory },
    { provide: HotkeysService, useFactory: hotkeysServiceFactory },
    { provide: WakelockService, useFactory: wakelockServiceFactory },
    { provide: MediaSessionService, useFactory: mediaSessionServiceFactory },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        showDelay: 800,
        position: 'above',
        disableTooltipInteractivity: true
      }
    }
  ]
};
