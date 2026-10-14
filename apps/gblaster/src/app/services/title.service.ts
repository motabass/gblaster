import { inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly angularTitleService = inject(Title);

  private readonly _title = signal<string>('');
  readonly title = this._title.asReadonly();

  setTitle(title: string) {
    this.angularTitleService.setTitle(title);
    this._title.set(title);
  }
}
