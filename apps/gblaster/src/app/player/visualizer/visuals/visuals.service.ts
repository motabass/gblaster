import { inject, Service, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import type { VisualizerMode } from './visuals.types';
import { getNextVisualizerMode } from './visuals-helper';

/**
Stores and cycles the currently selected audio visualizer mode.
*/
@Service()
export class VisualsService {
  readonly #localStorageService = inject(LocalStorageService);

  readonly #visualMode = signal<VisualizerMode>(this.#localStorageService.retrieve('visualMode') ?? 'off');
  readonly visualMode = this.#visualMode.asReadonly();

  /**
  Advances to the next visualizer mode and persists the selection.
  */
  toggleVisualMode() {
    const nextMode = getNextVisualizerMode(this.visualMode());
    this.#visualMode.set(nextMode);
    this.#localStorageService.store('visualMode', nextMode);
  }
}
