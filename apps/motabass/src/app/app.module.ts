import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ThemeModule } from '@motabass/core/theme';
import { UpdateModule } from '@motabass/core/update';
import { DialogsModule } from '@motabass/ui-components/dialogs';
import { MccColorPickerModule } from 'material-community-components';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ShellComponent } from './shell/shell.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';

@NgModule({
  declarations: [AppComponent, ShellComponent, ThemeSettingsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        { path: '', redirectTo: 'blog', pathMatch: 'full' },
        { path: 'player', loadChildren: () => import('@motabass/player').then((m) => m.PlayerModule) },
        { path: 'settings', component: ThemeSettingsComponent },
        { path: '**', redirectTo: '' }
      ],
      { initialNavigation: 'enabled' }
    ),
    NgxWebstorageModule.forRoot(),
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    DialogsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatCheckboxModule,
    MatCardModule,
    UpdateModule,
    ThemeModule,
    MccColorPickerModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
