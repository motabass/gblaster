import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  readonly #angularTitleService = inject(Title);

  readonly #title = signal<string>('');
  readonly title = this.#title.asReadonly();

  setTitle(title: string) {
    this.#angularTitleService.setTitle(title);
    this.#title.set(title);
  }
}
