import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import type { VisualizerMode } from './visuals.types';
import { getNextVisualizerMode } from './visuals-helper';

@Injectable({
  providedIn: 'root'
})
export class VisualsService {
  private readonly localStorageService = inject(LocalStorageService);

  readonly visualMode = signal<VisualizerMode>(this.localStorageService.retrieve('visualMode') ?? 'off');

  toggleVisualMode() {
    const nextMode = getNextVisualizerMode(this.visualMode());
    this.visualMode.set(nextMode);
    this.localStorageService.store('visualMode', nextMode);
  }
}
