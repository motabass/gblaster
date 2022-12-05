import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = new Subject<boolean>();

  counter = 0;

  show() {
    if (this.counter === 0) {
      this.isLoading.next(true);
    }
    this.counter += 1;
  }
  hide() {
    this.counter -= 1;
    if (this.counter === 0) {
      this.isLoading.next(false);
    }
  }
}
