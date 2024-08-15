import { Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  title = signal<string>('');

  constructor(private angularTitleService: Title) {}

  setTitle(title: string) {
    this.angularTitleService.setTitle(title);
    this.title.set(title);
  }
}
