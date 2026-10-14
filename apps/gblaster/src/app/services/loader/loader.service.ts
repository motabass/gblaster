import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private loadingCounter = 0;

  show() {
    if (this.loadingCounter === 0) {
      this._isLoading.set(true);
    }
    this.loadingCounter += 1;
  }

  hide() {
    if (this.loadingCounter > 0) {
      this.loadingCounter -= 1;

      if (this.loadingCounter === 0) {
        this._isLoading.set(false);
      }
    } else {
      console.warn('LoaderService: hide called without matching show call');
    }
  }
}
