import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatIconSizeModule } from '@motabass/material-helpers/mat-icon-size';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ShellComponent } from './shell/shell.component';
import { DialogsModule } from '@motabass/ui-components/dialogs';
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

@NgModule({
  declarations: [AppComponent, ShellComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        { path: '', redirectTo: 'player', pathMatch: 'full' },
        { path: 'player', loadChildren: () => import('./player/player.module').then((m) => m.PlayerModule) },
        { path: 'settings', loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule) },
        { path: '**', redirectTo: '' }
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    NgxWebstorageModule.forRoot(),
    NgxIndexedDBModule.forRoot(dbConfig),
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatIconSizeModule,
    MatProgressSpinnerModule,
    DialogsModule
  ],
  bootstrap: [AppComponent],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }]
})
export class AppModule {}
