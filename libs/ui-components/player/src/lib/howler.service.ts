import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class HowlerService {
  analyser: AnalyserNode;

  constructor() {}

  set volume(volume: number) {
    Howler.volume(volume);
  }

  get volume(): number {
    return Howler.volume();
  }

  initAnalyser() {
    const analyser = Howler.ctx.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.8;

    analyser.connect(Howler.ctx.destination);

    this.analyser = analyser;
  }

  createSound(file: File, onLoad: () => void): Howl {
    const howl = new Howl({
      src: URL.createObjectURL(file),
      format: file.type,
      html5: true,
      preload: false,
      autoplay: false,
      loop: false,
      onload: onLoad,
      onloaderror: (id, err) => {
        console.log('loaderror:', err);
      }
    });
    return howl;
  }

  getAnalyserFromHowl(howl: Howl): AnalyserNode {
    if (!this.analyser) {
      this.initAnalyser();
    }
    const audioNode = howl['_sounds'][0]['_node'];

    const audioElement = Howler.ctx.createMediaElementSource(audioNode);
    audioElement.connect(this.analyser);

    return this.analyser;
  }
}
