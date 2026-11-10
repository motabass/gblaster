import { Component } from '@angular/core';
import { StorageSettingsComponent } from './storage-settings/storage-settings.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';
import { MetadataSettingsComponent } from './metadata-settings/metadata-settings.component';

/**
Aggregates the application's storage, theme, and metadata settings.
*/
@Component({
  imports: [MetadataSettingsComponent, ThemeSettingsComponent, StorageSettingsComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export default class SettingsComponent {}
