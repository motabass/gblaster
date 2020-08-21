import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ThemeModule } from '@motabass/core/theme';
import { UpdateModule } from '@motabass/core/update';
import { LoaderInterceptor } from '@motabass/helper-services/loader';
import { MatIconSizeModule } from '@motabass/material-helpers/mat-icon-size';
import { DialogsModule } from '@motabass/ui-components/dialogs';
import { MccColorPickerModule } from 'material-community-components';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { SettingsComponent } from './settings/settings.component';
import { StorageSettingsComponent } from './settings/storage-settings/storage-settings.component';
import { ThemeSettingsComponent } from './settings/theme-settings/theme-settings.component';
import { ShellComponent } from './shell/shell.component';

const dbConfig: DBConfig = {
  name: 'metadataCache',
  version: 1,
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
    }
  ]
};

@NgModule({
  declarations: [AppComponent, ShellComponent, ThemeSettingsComponent, SettingsComponent, StorageSettingsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        { path: '', redirectTo: 'player', pathMatch: 'full' },
        { path: 'player', loadChildren: () => import('@motabass/player').then((m) => m.PlayerModule) },
        { path: 'settings', component: SettingsComponent },
        { path: '**', redirectTo: '' }
      ],
      { initialNavigation: 'enabled' }
    ),
    NgxWebstorageModule.forRoot(),
    NgxIndexedDBModule.forRoot(dbConfig),
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    DialogsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    MatCheckboxModule,
    MatCardModule,
    UpdateModule,
    ThemeModule,
    MccColorPickerModule.forRoot({ selected_svg_icon: 'check'}),
    FlexLayoutModule,
    MatIconSizeModule,
    MatProgressSpinnerModule
  ],
  bootstrap: [AppComponent],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }]
})
export class AppModule {}
