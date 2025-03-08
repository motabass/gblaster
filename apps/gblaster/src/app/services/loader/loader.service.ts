import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  readonly isLoading = signal<boolean>(false);

  private loadingCounter = 0;

  show() {
    if (this.loadingCounter === 0) {
      this.isLoading.set(true);
    }
    this.loadingCounter += 1;
  }

  hide() {
    if (this.loadingCounter > 0) {
      this.loadingCounter -= 1;

      if (this.loadingCounter === 0) {
        this.isLoading.set(false);
      }
    } else {
      console.warn('LoaderService: hide called without matching show call');
    }
  }
}
