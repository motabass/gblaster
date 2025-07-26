import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import type { VisualizerMode } from './visuals.types';

@Injectable({
  providedIn: 'root'
})
export class VisualsService {
  private readonly localStorageService = inject(LocalStorageService);

  readonly visualMode = signal<VisualizerMode>(this.localStorageService.retrieve('visualMode') ?? 'off');

  toggleVisualMode() {
    let nextMode: VisualizerMode;
    switch (this.visualMode()) {
      case 'off': {
        nextMode = 'bars';
        break;
      }
      case 'bars': {
        nextMode = 'circular-bars';
        break;
      }
      case 'circular-bars': {
        nextMode = 'osc';
        break;
      }
      case 'osc': {
        nextMode = 'circular-osc';
        break;
      }
      case 'circular-osc': {
        nextMode = 'off';
        break;
      }
    }
    this.visualMode.set(nextMode);
    this.localStorageService.store('visualMode', nextMode);
  }
}
