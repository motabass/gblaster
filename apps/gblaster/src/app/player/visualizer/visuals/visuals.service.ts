import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import type { VisualizerMode } from './visuals.types';
import { getNextVisualizerMode } from './visuals-helper';

@Injectable({
  providedIn: 'root'
})
export class VisualsService {
  private readonly localStorageService = inject(LocalStorageService);

  private readonly _visualMode = signal<VisualizerMode>(this.localStorageService.retrieve('visualMode') ?? 'off');
  readonly visualMode = this._visualMode.asReadonly();

  toggleVisualMode() {
    const nextMode = getNextVisualizerMode(this.visualMode());
    this._visualMode.set(nextMode);
    this.localStorageService.store('visualMode', nextMode);
  }
}
