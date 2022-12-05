import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  defaultTitle = 'gBlaster';
  private dataSource: BehaviorSubject<string> = new BehaviorSubject(this.defaultTitle);
  title = this.dataSource.asObservable();

  constructor(private titleService: Title) {}

  setTitle(title: string) {
    this.titleService.setTitle(title);
    this.dataSource.next(title);
  }
}
