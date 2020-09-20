import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { MccColorPickerModule } from 'material-community-components/color-picker';
import { SettingsComponent } from './settings.component';
import { StorageSettingsComponent } from './storage-settings/storage-settings.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    FlexModule,
    MatButtonModule,
    MccColorPickerModule,
    MatCheckboxModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: SettingsComponent }]),
    MccColorPickerModule.forRoot({ selected_svg_icon: 'check' })
  ],
  declarations: [SettingsComponent, StorageSettingsComponent, ThemeSettingsComponent]
})
export class SettingsModule {}
