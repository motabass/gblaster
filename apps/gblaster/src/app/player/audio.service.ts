import { computed, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FrequencyBand } from './player.types';
import { Subject } from 'rxjs';

export const FREQUENCY_BANDS: FrequencyBand[] = [60, 170, 310, 600, 1000, 3000, 6000, 12_000, 14_000, 16_000];

export interface EqualizerGainValues {
  [band: number]: number;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private localStorageService = inject(LocalStorageService);

  // Core audio elements
  private _audioElement: HTMLAudioElement;
  private _audioContext: AudioContext;
  private _audioSourceNode: MediaElementAudioSourceNode;
  private _gainNode: GainNode;
  private _eqGainNode: GainNode;
  private _frequencyFilters: { [band: number]: BiquadFilterNode } = {};
  private _connectedAnalyzers = new Set<AnalyserNode>();

  // State signals
  readonly isLoading = signal(false);
  readonly isPlaying = signal(false);
  readonly isPaused = signal(true);
  readonly isStopped = signal(true);
  readonly isLooping = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(this.localStorageService.retrieve('volume') ?? 0.5);
  readonly baseGain = signal(this.localStorageService.retrieve('baseGain') ?? 1);
  readonly sampleRate = signal(44_100);

  readonly equalizerGainValues = signal<EqualizerGainValues>(
    this.localStorageService.retrieve('equalizerGainValues') ?? { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12_000: 0, 14_000: 0, 16_000: 0 }
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
      this.isStopped.set(false);
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

  plugInNewAnalyserNode(): AnalyserNode {
    const analyser = this._audioContext.createAnalyser();
    this._eqGainNode.connect(analyser);
    this._connectedAnalyzers.add(analyser);
    return analyser;
  }

  disconnectAnalyserNode(analyser: AnalyserNode): void {
    if (this._connectedAnalyzers.has(analyser)) {
      this._eqGainNode.disconnect(analyser);
      this._connectedAnalyzers.delete(analyser);
    }
  }

  // Call on major cleanup events or app exit
  disconnectAllAnalyzers(): void {
    this._connectedAnalyzers.forEach((analyser) => {
      this._eqGainNode.disconnect(analyser);
    });
    this._connectedAnalyzers.clear();
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
    if (this.isPlaying()) {
      this._audioElement.pause();
    }
  }

  stop() {
    if (this.isPlaying()) {
      this.pause();
    }
    this.seekToPosition(0);
    this.isStopped.set(true);
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

    const bandGains = structuredClone(this.equalizerGainValues());
    bandGains[bandFrequency] = gainValue;

    this.localStorageService.store('equalizerGainValues', bandGains);
    this.equalizerGainValues.set(bandGains);
  }

  setVolume(value: number) {
    if (value >= 0 && value <= 1) {
      this._gainNode.gain.value = value;
      this.volume.set(value);
      this.localStorageService.store('volume', value);
    }
  }

  setBaseGain(volume: number) {
    this._eqGainNode.gain.value = volume;
    this.baseGain.set(volume);
    this.localStorageService.store('baseGain', volume);
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
        // Add a gentle slope for low shelf
        filter.Q.value = 0.7;
      } else if (index === FREQUENCY_BANDS.length - 1) {
        // The last filter, includes all higher frequencies
        filter.type = 'highshelf';
        // Add a gentle slope for high shelf
        filter.Q.value = 0.7;
      } else {
        filter.type = 'peaking';

        // Use different Q values based on frequency ranges
        if (bandFrequency < 250) {
          filter.Q.value = 0.8; // Wider for low frequencies
        } else if (bandFrequency < 2000) {
          filter.Q.value = 0.7; // Medium for mid frequencies
        } else {
          filter.Q.value = 0.6; // Narrower for high frequencies
        }
      }
      filter.frequency.value = bandFrequency;

      output.connect(filter);
      output = filter;
    }

    return { eqInput: input, eqOutput: output };
  }
}
