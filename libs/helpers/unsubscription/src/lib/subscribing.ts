import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export class Subscribing implements OnDestroy {
  destroy$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
