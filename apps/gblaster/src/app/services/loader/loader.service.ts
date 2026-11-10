import { Service, signal } from '@angular/core';

/**
Tracks nested loading operations and exposes their aggregate loading state.
*/
@Service()
export class LoaderService {
  readonly #isLoading = signal<boolean>(false);
  readonly isLoading = this.#isLoading.asReadonly();

  #loadingCounter = 0;

  /**
  Begins a loading operation and enables the loading state when needed.
  */
  show() {
    if (this.#loadingCounter === 0) {
      this.#isLoading.set(true);
    }
    this.#loadingCounter += 1;
  }

  /**
  Completes a loading operation and disables loading after the last one ends.
  */
  hide() {
    if (this.#loadingCounter > 0) {
      this.#loadingCounter -= 1;

      if (this.#loadingCounter === 0) {
        this.#isLoading.set(false);
      }
    } else {
      console.warn('LoaderService: hide called without matching show call');
    }
  }
}
