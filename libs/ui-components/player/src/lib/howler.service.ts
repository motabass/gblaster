import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class HowlerService {
  analyserCtx: AudioContext;
  analyser: AnalyserNode;

  constructor() {
    this.analyserCtx = new AudioContext();
    const analyser = this.analyserCtx.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.8;

    analyser.connect(this.analyserCtx.destination);

    this.analyser = analyser;
  }

  set volume(volume: number) {
    Howler.volume(volume);
  }

  get volume(): number {
    return Howler.volume();
  }

  createHowlFromFile(file: File): Howl {
    return new Howl({
      src: URL.createObjectURL(file),
      format: file.type,
      html5: true,
      preload: true,
      autoplay: false,
      loop: false,
      onload: () => {
        console.log('Loaded File');
        this.connectAnalyserToCurrentHowl();
      },
      onloaderror: (id, err) => {
        console.log('Load error: ', id, err);
      }
    });
  }

  connectAnalyserToCurrentHowl() {
    const audioNode: HTMLAudioElement = Howler['_howls'][0]['_sounds'][0]['_node'];

    try {
      const audioElement = this.analyserCtx.createMediaElementSource(audioNode);
      audioElement.connect(this.analyser);
    } catch (e) {}
  }

  getAnalyzer(): AnalyserNode {
    return this.analyser;
  }

  isPlaying(): boolean {
    return this.currentHowl.playing();
  }

  get currentHowl(): Howl {
    return Howler['_howls'][0];
  }

  play() {
    this.currentHowl.play();
  }

  pause() {
    this.currentHowl.pause();
  }

  stop() {
    this.currentHowl.stop();
  }
}
