import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { StorageSettingsComponent } from './storage-settings/storage-settings.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';
import { MetadataSettingsComponent } from './metadata-settings/metadata-settings.component';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    FlexModule,
    MatButtonModule,
    MatCheckboxModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: SettingsComponent }]),
    MatSlideToggleModule
  ],
  declarations: [SettingsComponent, StorageSettingsComponent, ThemeSettingsComponent, MetadataSettingsComponent]
})
export class SettingsModule {}
