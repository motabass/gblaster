import { Component } from '@angular/core';
import { StorageSettingsComponent } from './storage-settings/storage-settings.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';
import { MetadataSettingsComponent } from './metadata-settings/metadata-settings.component';

@Component({
  selector: 'mtb-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [MetadataSettingsComponent, ThemeSettingsComponent, StorageSettingsComponent]
})
export class SettingsComponent {
  constructor() {}
}
