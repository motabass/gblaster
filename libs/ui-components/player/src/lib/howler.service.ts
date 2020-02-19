import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';
import { Song } from './player.types';

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
    analyser.connect(this.analyserCtx.destination);

    this.analyser = analyser;
  }

  set volume(volume: number) {
    Howler.volume(volume);
  }

  get volume(): number {
    return Howler.volume();
  }

  playSong(song: Song) {
    // song.howl.load();
    song.howl.play();
    this.connectAnalyserToHowl(song.howl);
  }

  createHowlFromFile(file: File): Howl {
    const blobUrl = URL.createObjectURL(file);
    const howl = new Howl({
      src: blobUrl,
      format: file.type,
      html5: true,
      preload: true,
      autoplay: false,
      loop: false,
      onload: () => console.log('Loaded File'),
      onloaderror: (id, err) => console.log('Load error: ', id, err)
    });
    return howl;
  }

  private connectAnalyserToHowl(howl: Howl) {
    const audioNode: HTMLAudioElement = howl['_sounds'][0]['_node'];

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
}
