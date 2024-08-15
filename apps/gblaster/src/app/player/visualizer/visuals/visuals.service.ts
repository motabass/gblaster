import { Injectable } from '@angular/core';
import { action, observable } from 'mobx-angular';
import { LocalStorageService } from 'ngx-webstorage';
import type { VisualizerMode } from './visuals.types';

@Injectable({
  providedIn: 'root'
})
export class VisualsService {
  @observable visualMode!: VisualizerMode;

  constructor(private localStorageService: LocalStorageService) {
    const mode = this.localStorageService.retrieve('visualMode');
    this.visualMode = mode ?? 'off';
  }

  @action toggleVisualMode() {
    switch (this.visualMode) {
      case 'off':
        this.visualMode = 'bars';
        this.localStorageService.store('visualMode', 'bars');
        break;
      case 'bars':
        this.visualMode = 'osc';
        this.localStorageService.store('visualMode', 'osc');
        break;
      case 'osc':
        this.visualMode = 'off';
        this.localStorageService.store('visualMode', 'off');
        break;
    }
  }
}
