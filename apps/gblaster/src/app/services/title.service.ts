import { inject, Service, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
Keeps the document title synchronized with a readable application signal.
*/
@Service()
export class TitleService {
  readonly #angularTitleService = inject(Title);

  readonly #title = signal<string>('');
  readonly title = this.#title.asReadonly();

  /**
  Sets the document title and publishes the same value through the title signal.
  @param title New document and application title.
  */
  setTitle(title: string) {
    this.#angularTitleService.setTitle(title);
    this.#title.set(title);
  }
}
