import { Injectable } from '@angular/core';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { FrequencyBand } from './player.types';

const FREQUENCY_BANDS: FrequencyBand[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

@Injectable({ providedIn: 'root' })
export class AudioService {
  private _audioElement: HTMLAudioElement;
  private _audioContext: AudioContext;
  private _audioSourceNode: MediaElementAudioSourceNode;
  private _gainNode: GainNode;
  private _eqGainNode: GainNode;
  private _frequencyFilters: { [band: number]: BiquadFilterNode } = {};

  @LocalStorage('equalizerGainValues', { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 })
  private _equalizerGainValues!: {
    [band: number]: number;
  };

  constructor(private storageService: LocalStorageService) {
    // create audio element
    const audioElement = new Audio();
    audioElement.loop = false;
    audioElement.id = 'main_audio';
    audioElement.style.display = 'none';
    audioElement.autoplay = false;
    audioElement.controls = false;
    audioElement.volume = 0.5;
    audioElement.preload = 'auto';

    audioElement.addEventListener('error', (error) => {
      console.error(error);
    });

    // TODO: only for cypress test!?
    document.body.append(audioElement);

    // initialize audio context
    const audioContext = new AudioContext({
      latencyHint: 'playback'
    });

    // create audio nodes
    const audioSource = audioContext.createMediaElementSource(audioElement);
    const gain = audioContext.createGain();
    const eqGain = audioContext.createGain();
    const { eqInput, eqOutput } = this.createEqualizer(audioContext);

    // connect audio nodes
    audioSource.connect(eqGain);
    eqGain.connect(eqInput);
    eqOutput.connect(gain);
    gain.connect(audioContext.destination);

    // set eq settings from localstorage
    for (const frequencyBand of FREQUENCY_BANDS) {
      const filter = this._frequencyFilters[frequencyBand];
      filter.gain.value = this._equalizerGainValues[frequencyBand];
    }

    // set volume setting from localstorage
    const storedVolume = this.storageService.retrieve('volume');
    gain.gain.value = storedVolume ?? 0.5;

    this._audioElement = audioElement;
    this._audioSourceNode = audioSource;
    this._audioContext = audioContext;
    this._eqGainNode = eqGain;
    this._gainNode = gain;
  }

  private createEqualizer(audioContext: AudioContext): { eqInput: AudioNode; eqOutput: AudioNode } {
    const input = audioContext.createGain();
    input.gain.value = 1;

    let output = input;
    for (const [i, bandFrequency] of FREQUENCY_BANDS.entries()) {
      const filter = audioContext.createBiquadFilter();

      this._frequencyFilters[bandFrequency] = filter;

      if (i === 0) {
        // The first filter, includes all lower frequencies
        filter.type = 'lowshelf';
      } else if (i === FREQUENCY_BANDS.length - 1) {
        // The last filter, includes all higher frequencies
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1;
      }
      filter.frequency.value = bandFrequency;

      output.connect(filter);
      output = filter;
    }

    return { eqInput: input, eqOutput: output };
  }

  plugAnalyser(): AnalyserNode {
    const analyser = this._audioContext.createAnalyser();
    this._audioSourceNode.connect(analyser);
    return analyser;
  }

  // AUDIO ELEMENT CONTROL

  setSource(url: string) {
    this._audioElement.src = url;
  }

  setFileAsSource(file: File) {
    const oldSrc = this._audioElement.src;

    this._audioElement.src = URL.createObjectURL(file);

    URL.revokeObjectURL(oldSrc);
  }

  async play() {
    if (this._audioContext.state === 'suspended') {
      await this._audioContext.resume();
    }

    return this._audioElement.play();
  }

  get playing(): boolean {
    return !this._audioElement.paused;
  }

  pause() {
    this._audioElement.pause();
  }

  get paused(): boolean {
    return this._audioElement.paused;
  }

  setLoop(loop: boolean) {
    this._audioElement.loop = loop;
  }

  setOnEnded(callback: () => any) {
    this._audioElement.addEventListener('ended', callback);
  }

  get duration(): number {
    return this._audioElement.duration;
  }

  get currentTime(): number {
    return this._audioElement.currentTime;
  }

  seekToPosition(position: number, fastSeek = false) {
    if ('fastSeek' in this._audioElement && fastSeek) {
      this._audioElement.fastSeek(position);
    } else {
      this._audioElement.currentTime = position;
    }
  }

  getBandGain(bandFrequency: FrequencyBand): number {
    return this._equalizerGainValues[bandFrequency];
  }

  setGainForFrequency(bandFrequency: FrequencyBand, gainValue: number) {
    this._frequencyFilters[bandFrequency].gain.value = gainValue;

    const bandGains = this._equalizerGainValues;
    bandGains[bandFrequency] = gainValue;
    this._equalizerGainValues = bandGains;
  }

  setVolume(value: number) {
    if (value >= 0 && value <= 1) {
      this.storageService.store('volume', value);
      this._gainNode.gain.value = value;
    }
  }

  get volume() {
    return this._gainNode.gain.value;
  }

  get baseGain() {
    return this._eqGainNode.gain.value;
  }

  setBaseGain(volume: number) {
    this._eqGainNode.gain.value = volume;
  }

  get sampleRate(): number {
    return this._audioContext.sampleRate;
  }
}
