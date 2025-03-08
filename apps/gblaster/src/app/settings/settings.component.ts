import { Component } from '@angular/core';
import { StorageSettingsComponent } from './storage-settings/storage-settings.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';
import { MetadataSettingsComponent } from './metadata-settings/metadata-settings.component';

@Component({
  selector: 'mtb-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  imports: [MetadataSettingsComponent, ThemeSettingsComponent, StorageSettingsComponent]
})
export default class SettingsComponent {}
