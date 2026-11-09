import { Service, signal } from '@angular/core';

@Service()
export class LoaderService {
  readonly #isLoading = signal<boolean>(false);
  readonly isLoading = this.#isLoading.asReadonly();

  #loadingCounter = 0;

  show() {
    if (this.#loadingCounter === 0) {
      this.#isLoading.set(true);
    }
    this.#loadingCounter += 1;
  }

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
