import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FrequencyBand } from './player.types';
import { Subject } from 'rxjs';

export const FREQUENCY_BANDS: FrequencyBand[] = [60, 170, 310, 600, 1000, 3000, 6000, 12_000, 14_000, 16_000];

export type EqualizerGainValues = { [band: number]: number };

@Injectable({ providedIn: 'root' })
export class AudioService {
  private storageService = inject(LocalStorageService);

  // Core audio elements
  private _audioElement: HTMLAudioElement;
  private _audioContext: AudioContext;
  private _audioSourceNode: MediaElementAudioSourceNode;
  private _gainNode: GainNode;
  private _eqGainNode: GainNode;
  private _frequencyFilters: { [band: number]: BiquadFilterNode } = {};

  // State signals
  readonly isLoading = signal(false);
  readonly isPlaying = signal(false);
  readonly isPaused = signal(true);
  readonly isLooping = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(this.storageService.retrieve('volume') ?? 0.5);
  readonly baseGain = signal(this.storageService.retrieve('baseGain') ?? 1);
  readonly sampleRate = signal(44_100);

  readonly equalizerGainValues = signal<EqualizerGainValues>(
    this.storageService.retrieve('equalizerGainValues') ?? { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12_000: 0, 14_000: 0, 16_000: 0 }
  );

  private readonly _hasEnded = new Subject<boolean>();

  get hasEnded$() {
    return this._hasEnded.asObservable();
  }

  constructor() {
    // create audio element
    const audioElement = new Audio();
    audioElement.loop = false;
    audioElement.id = 'main_audio';
    audioElement.style.display = 'none';
    audioElement.autoplay = false;
    audioElement.controls = false;
    audioElement.volume = this.volume();
    audioElement.preload = 'auto';

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
    for (const band of FREQUENCY_BANDS) {
      const filter = this._frequencyFilters[band];
      filter.gain.value = this.equalizerGainValues()[band];
    }
    eqGain.gain.value = this.baseGain();

    gain.gain.value = this.volume();

    this._audioElement = audioElement;
    this._audioSourceNode = audioSource;
    this._audioContext = audioContext;
    this._eqGainNode = eqGain;
    this._gainNode = gain;

    this._audioElement.addEventListener('error', (error) => {
      console.error(error);
      this.isLoading.set(false);
    });

    // this._audioElement.addEventListener('loadeddata', (error) => {
    //
    // });

    this._audioElement.addEventListener('loadstart', () => {
      this.isLoading.set(true);
    });

    this._audioElement.addEventListener('canplay', () => {
      this.isLoading.set(false);
    });

    // Add event listeners to update signals
    this._audioElement.addEventListener('timeupdate', () => {
      this.currentTime.set(this._audioElement.currentTime);
    });

    this._audioElement.addEventListener('durationchange', () => {
      this.duration.set(this._audioElement.duration);
    });

    this._audioElement.addEventListener('play', () => {
      this.sampleRate.set(this._audioContext.sampleRate);
      this.isPlaying.set(true);
      this.isPaused.set(false);
    });

    this._audioElement.addEventListener('pause', () => {
      this.isPlaying.set(false);
      this.isPaused.set(true);
    });

    this._audioElement.addEventListener('ended', () => {
      this._hasEnded.next(true);
    });
  }

  private createEqualizer(audioContext: AudioContext): { eqInput: AudioNode; eqOutput: AudioNode } {
    const input = audioContext.createGain();
    input.gain.value = 1;

    let output = input;
    for (const [index, bandFrequency] of FREQUENCY_BANDS.entries()) {
      const filter = audioContext.createBiquadFilter();

      this._frequencyFilters[bandFrequency] = filter;

      if (index === 0) {
        // The first filter, includes all lower frequencies
        filter.type = 'lowshelf';
      } else if (index === FREQUENCY_BANDS.length - 1) {
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

  plugInNewAnalyserNode(): AnalyserNode {
    const analyser = this._audioContext.createAnalyser();
    this._audioSourceNode.connect(analyser);
    return analyser;
  }

  setFileAsSource(file: File) {
    const oldSource = this._audioElement.src;
    this._audioElement.src = URL.createObjectURL(file);
    URL.revokeObjectURL(oldSource);
  }

  async play() {
    if (this._audioContext.state === 'suspended') {
      await this._audioContext.resume();
    }

    return this._audioElement.play();
  }

  pause() {
    this._audioElement.pause();
  }

  setLoop(loop: boolean) {
    this._audioElement.loop = loop;
    this.isLooping.set(loop);
  }

  seekToPosition(position: number, fastSeek = false) {
    if ('fastSeek' in this._audioElement && fastSeek) {
      this._audioElement.fastSeek(position);
    } else {
      this._audioElement.currentTime = position;
    }
  }

  getFrequencyBandGainSignal(bandFrequency: FrequencyBand) {
    return computed(() => this.equalizerGainValues()[bandFrequency]);
  }

  setFrequencyBandGain(bandFrequency: FrequencyBand, gainValue: number) {
    this._frequencyFilters[bandFrequency].gain.value = gainValue;

    const bandGains = this.equalizerGainValues();
    bandGains[bandFrequency] = gainValue;
    this.equalizerGainValues.set(bandGains);
  }

  setVolume(value: number) {
    if (value >= 0 && value <= 1) {
      this._gainNode.gain.value = value;
      this.volume.set(value);
      this.storageService.store('volume', value);
    }
  }

  setBaseGain(volume: number) {
    this._eqGainNode.gain.value = volume;
    this.baseGain.set(volume);
    this.storageService.store('baseGain', volume);
  }
}
