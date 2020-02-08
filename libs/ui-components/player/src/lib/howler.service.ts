import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class HowlerService {
  constructor() {
  }

  createSound(file: File, onLoad: () => void): Howl {
    const sound = new Howl({
      src: URL.createObjectURL(file),
      format: file.type,
      html5: true,
      preload: true,
      autoplay: false,
      loop: false,
      onload: onLoad
    });
    return sound;
  }

  get analyser(): AnalyserNode {
    const analyzer = Howler.ctx.createAnalyser();
    analyzer.fftSize = 512;
    analyzer.minDecibels = -90;
    analyzer.maxDecibels = 0;
    analyzer.smoothingTimeConstant = 0.8;

    Howler.masterGain.connect(analyzer);
    return analyzer;
  }

  get audioContext(): AudioContext {
    return Howler.ctx;
  }

  set volume(volume: number) {
    Howler.volume(volume);
  }

  get volume(): number {
    return Howler.volume();
  }
}
