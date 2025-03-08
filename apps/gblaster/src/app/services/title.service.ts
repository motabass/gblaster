import { Injectable, signal, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private angularTitleService = inject(Title);

  readonly title = signal<string>('');

  setTitle(title: string) {
    this.angularTitleService.setTitle(title);
    this.title.set(title);
  }
}
