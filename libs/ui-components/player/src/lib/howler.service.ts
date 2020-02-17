import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class HowlerService {
  constructor() {}

  set volume(volume: number) {
    Howler.volume(volume);
  }

  get volume(): number {
    return Howler.volume();
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
    const audio = howl['_sounds'][0]['_node'];

    const analyser = Howler.ctx.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.8;

    const audioElement = Howler.ctx.createMediaElementSource(audio);
    audioElement.connect(analyser);

    return analyser;
  }
}
