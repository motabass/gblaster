import { Injectable, signal, inject } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import type { VisualizerMode } from './visuals.types';

@Injectable({
  providedIn: 'root'
})
export class VisualsService {
  private localStorageService = inject(LocalStorageService);

  visualMode = signal<VisualizerMode>('off');

  constructor() {
    const mode = this.localStorageService.retrieve('visualMode');
    if (mode) {
      this.visualMode.set(mode);
    }
  }

  toggleVisualMode() {
    switch (this.visualMode()) {
      case 'off':
        this.visualMode.set('bars');
        this.localStorageService.store('visualMode', 'bars');
        break;
      case 'bars':
        this.visualMode.set('osc');
        this.localStorageService.store('visualMode', 'osc');
        break;
      case 'osc':
        this.visualMode.set('off');
        this.localStorageService.store('visualMode', 'off');
        break;
    }
  }
}
