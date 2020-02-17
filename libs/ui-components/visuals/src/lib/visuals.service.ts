import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisualsService {
  private _analyserSubject: Subject<AnalyserNode> = new BehaviorSubject(null);

  constructor() {}

  get analyserSubject(): Subject<AnalyserNode> {
    return this._analyserSubject;
  }

  set analyser(analyser: AnalyserNode) {
    this._analyserSubject.next(analyser);
  }
}
