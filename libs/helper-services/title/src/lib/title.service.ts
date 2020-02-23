import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private dataSource: BehaviorSubject<string> = new BehaviorSubject('m0taba55');
  title = this.dataSource.asObservable();

  constructor(private titleService: Title) {}

  setTitle(title: string) {
    this.titleService.setTitle(title);
    this.dataSource.next(title);
  }
}
