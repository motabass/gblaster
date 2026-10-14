import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FREQUENCY_BANDS, FrequencyBand } from './player.types';
import { Subject } from 'rxjs';
import { createEqualizer } from './audio-helper';

export type EqualizerGainValues = {
  [Band in FrequencyBand]: number;
};

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly localStorageService = inject(LocalStorageService);

  // Core audio elements
  private readonly _audioElement: HTMLAudioElement;
  private readonly _audioContext: AudioContext;
  private readonly _gainNode: GainNode;
  private readonly _eqGainNode: GainNode;
  private readonly _frequencyFilters: Record<FrequencyBand, BiquadFilterNode>;
  private readonly _connectedAnalyzers = new Set<AnalyserNode>();
  private readonly _frequencyBandGainSignals = new Map<FrequencyBand, Signal<number>>();

  // State signals
  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();
  private readonly _isPlaying = signal(false);
  readonly isPlaying = this._isPlaying.asReadonly();
  private readonly _isPaused = signal(true);
  readonly isPaused = this._isPaused.asReadonly();
  private readonly _isStopped = signal(true);
  readonly isStopped = this._isStopped.asReadonly();
  private readonly _isLooping = signal(false);
  readonly isLooping = this._isLooping.asReadonly();
  private readonly _currentTime = signal(0);
  readonly currentTime = this._currentTime.asReadonly();
  private readonly _duration = signal(0);
  readonly duration = this._duration.asReadonly();
  private readonly _volume = signal(this.localStorageService.retrieve('volume') ?? 0.5);
  readonly volume = this._volume.asReadonly();
  private readonly _baseGain = signal(this.localStorageService.retrieve('baseGain') ?? 1);
  readonly baseGain = this._baseGain.asReadonly();
  private readonly _sampleRate = signal(44_100);
  readonly sampleRate = this._sampleRate.asReadonly();

  private readonly _equalizerGainValues = signal<EqualizerGainValues>(
    this.localStorageService.retrieve('equalizerGainValues') ?? {
      31: 0,
      63: 0,
      125: 0,
      250: 0,
      500: 0,
      1000: 0,
      2000: 0,
      4000: 0,
      8000: 0,
      16_000: 0
    }
  );
  readonly equalizerGainValues = this._equalizerGainValues.asReadonly();

  private readonly _hasEnded = new Subject<void>();

  readonly hasEnded$ = this._hasEnded.asObservable();

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

    // initialize audio context
    const audioContext = new AudioContext({
      latencyHint: 'playback'
    });

    // create audio nodes
    const audioSource = audioContext.createMediaElementSource(audioElement);
    const gain = audioContext.createGain();
    const eqGain = audioContext.createGain();
    const { eqInput, eqOutput, frequencyFilters } = createEqualizer(audioContext);
    this._frequencyFilters = frequencyFilters;

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
    this._audioContext = audioContext;
    this._eqGainNode = eqGain;
    this._gainNode = gain;

    this._audioElement.addEventListener('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('Audio element error:', error);
      this._isLoading.set(false);
    });

    this._audioElement.addEventListener('loadstart', () => {
      this._isLoading.set(true);
    });

    this._audioElement.addEventListener('canplay', () => {
      this._isLoading.set(false);
    });

    // Add event listeners to update signals
    this._audioElement.addEventListener('timeupdate', () => {
      this._currentTime.set(this._audioElement.currentTime);
    });

    this._audioElement.addEventListener('durationchange', () => {
      this._duration.set(this._audioElement.duration);
    });

    this._audioElement.addEventListener('play', () => {
      this._sampleRate.set(this._audioContext.sampleRate);
      this._isStopped.set(false);
      this._isPlaying.set(true);
      this._isPaused.set(false);
    });

    this._audioElement.addEventListener('pause', () => {
      this._isPlaying.set(false);
      this._isPaused.set(true);
    });

    this._audioElement.addEventListener('ended', () => {
      this._hasEnded.next();
    });
  }

  plugInNewAnalyserNode(): AnalyserNode {
    const analyser = this._audioContext.createAnalyser();
    this._eqGainNode.connect(analyser);
    this._connectedAnalyzers.add(analyser);
    return analyser;
  }

  disconnectAnalyserNode(analyser: AnalyserNode): void {
    if (!this._connectedAnalyzers.has(analyser)) {
      return;
    }

    this._eqGainNode.disconnect(analyser);
    this._connectedAnalyzers.delete(analyser);
  }

  // Call on major cleanup events or app exit
  disconnectAllAnalyzers(): void {
    for (const analyser of this._connectedAnalyzers) {
      this._eqGainNode.disconnect(analyser);
    }
    this._connectedAnalyzers.clear();
  }

  setFileAsSource(file: File) {
    const oldSource = this._audioElement.src;
    this._audioElement.src = URL.createObjectURL(file);
    if (oldSource.startsWith('blob:')) {
      URL.revokeObjectURL(oldSource);
    }
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
    this._isStopped.set(true);
  }

  setLoop(loop: boolean) {
    this._audioElement.loop = loop;
    this._isLooping.set(loop);
  }

  seekToPosition(position: number, fastSeek = false) {
    if (fastSeek && 'fastSeek' in this._audioElement) {
      this._audioElement.fastSeek(position);
    } else {
      this._audioElement.currentTime = position;
    }
  }

  getFrequencyBandGainSignal(bandFrequency: FrequencyBand): Signal<number> {
    let bandGainSignal = this._frequencyBandGainSignals.get(bandFrequency);
    if (!bandGainSignal) {
      bandGainSignal = computed(() => this.equalizerGainValues()[bandFrequency]);
      this._frequencyBandGainSignals.set(bandFrequency, bandGainSignal);
    }
    return bandGainSignal;
  }

  setFrequencyBandGain(bandFrequency: FrequencyBand, gainValue: number) {
    this._frequencyFilters[bandFrequency].gain.setTargetAtTime(gainValue, this._audioContext.currentTime, 0.01);

    const bandGains = structuredClone(this.equalizerGainValues());
    bandGains[bandFrequency] = gainValue;

    this.localStorageService.store('equalizerGainValues', bandGains);
    this._equalizerGainValues.set(bandGains);
  }

  resetFrequencyBandGain(bandFrequency: FrequencyBand) {
    this.setFrequencyBandGain(bandFrequency, 0);
  }

  setVolume(value: number) {
    if (!(value >= 0 && value <= 1)) {
      return;
    }

    this._gainNode.gain.setTargetAtTime(value, this._audioContext.currentTime, 0.01);
    this._volume.set(value);
    this.localStorageService.store('volume', value);
  }

  setBaseGain(volume: number) {
    this._eqGainNode.gain.setTargetAtTime(volume, this._audioContext.currentTime, 0.01);
    this._baseGain.set(volume);
    this.localStorageService.store('baseGain', volume);
  }
}
