import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { MccColorPickerModule } from 'material-community-components';
import { SettingsComponent } from './settings.component';
import { StorageSettingsComponent } from './storage-settings/storage-settings.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatButtonModule,
    MccColorPickerModule,
    MatCheckboxModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: SettingsComponent }]),
    MccColorPickerModule.forRoot({ selected_svg_icon: 'check' })
  ],
  declarations: [SettingsComponent, StorageSettingsComponent, ThemeSettingsComponent]
})
export class SettingsModule {}
