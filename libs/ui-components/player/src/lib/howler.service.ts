import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class HowlerService {
  private analyserCtx: AudioContext;
  private analyser: AnalyserNode;

  constructor() {
    this.initialzeAnalyserNode();
  }

  initialzeAnalyserNode() {
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

  private onLoaded() {
    console.log('Loaded File');
    this.connectAnalyserToCurrentHowl();
  }

  private onLoadError(id: number, err: Error) {
    console.log('Load error: ', id, err);
  }

  addFiles(files: File[]) {
    // this.howl = new Howl({
    //   src: URL.createObjectURL(file),
    //   format: file.type,
    //   html5: true,
    //   preload: true,
    //   autoplay: false,
    //   loop: false,
    //   onload: this.onLoaded,
    //   onloaderror: this.onLoadError
    // })
  }

  createHowlFromFile(file: File): Howl {
    return new Howl({
      src: URL.createObjectURL(file),
      format: file.type,
      html5: true,
      preload: true,
      autoplay: false,
      loop: false,
      onload: this.onLoaded.bind(this),
      onloaderror: this.onLoadError.bind(this)
    });
  }

  private connectAnalyserToCurrentHowl() {
    const audioNode: HTMLAudioElement = Howler['_howls'][0]['_sounds'][0]['_node'];

    try {
      const audioElement = this.analyserCtx.createMediaElementSource(audioNode);
      audioElement.connect(this.analyser);
    } catch (e) {
      // console.error(e);
    }
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
