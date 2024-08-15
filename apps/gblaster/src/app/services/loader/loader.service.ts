import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = signal<boolean>(false);

  counter = 0;

  show() {
    if (this.counter === 0) {
      this.isLoading.set(true);
    }
    this.counter += 1;
  }
  hide() {
    this.counter -= 1;
    if (this.counter === 0) {
      this.isLoading.set(false);
    }
  }
}
