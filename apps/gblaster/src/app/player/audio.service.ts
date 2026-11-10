import { computed, inject, Service, signal, Signal } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { FREQUENCY_BANDS, FrequencyBand } from './player.types';
import { Subject } from 'rxjs';
import { createEqualizer } from './audio-helper';

export type EqualizerGainValues = {
  [Band in FrequencyBand]: number;
};

/**
Owns the audio element, Web Audio graph, playback state, and equalizer.
*/
@Service()
export class AudioService {
  readonly #localStorageService = inject(LocalStorageService);

  // Core audio elements
  readonly #audioElement: HTMLAudioElement;
  readonly #audioContext: AudioContext;
  readonly #gainNode: GainNode;
  readonly #eqGainNode: GainNode;
  readonly #frequencyFilters: Record<FrequencyBand, BiquadFilterNode>;
  readonly #connectedAnalyzers = new Set<AnalyserNode>();
  readonly #frequencyBandGainSignals = new Map<FrequencyBand, Signal<number>>();

  // State signals
  readonly #isLoading = signal(false);
  readonly isLoading = this.#isLoading.asReadonly();
  readonly #isPlaying = signal(false);
  readonly isPlaying = this.#isPlaying.asReadonly();
  readonly #isPaused = signal(true);
  readonly isPaused = this.#isPaused.asReadonly();
  readonly #isStopped = signal(true);
  readonly isStopped = this.#isStopped.asReadonly();
  readonly #isLooping = signal(false);
  readonly isLooping = this.#isLooping.asReadonly();
  readonly #currentTime = signal(0);
  readonly currentTime = this.#currentTime.asReadonly();
  readonly #duration = signal(0);
  readonly duration = this.#duration.asReadonly();
  readonly #volume = signal(this.#localStorageService.retrieve('volume') ?? 0.5);
  readonly volume = this.#volume.asReadonly();
  readonly #baseGain = signal(this.#localStorageService.retrieve('baseGain') ?? 1);
  readonly baseGain = this.#baseGain.asReadonly();
  readonly #sampleRate = signal(44_100);
  readonly sampleRate = this.#sampleRate.asReadonly();

  readonly #equalizerGainValues = signal<EqualizerGainValues>(
    this.#localStorageService.retrieve('equalizerGainValues') ?? {
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
  readonly equalizerGainValues = this.#equalizerGainValues.asReadonly();

  readonly #hasEnded = new Subject<void>();

  readonly hasEnded$ = this.#hasEnded.asObservable();

  /**
  Creates the audio element and wires its Web Audio graph and event state.
  */
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
    this.#frequencyFilters = frequencyFilters;

    // connect audio nodes
    audioSource.connect(eqGain);
    eqGain.connect(eqInput);
    eqOutput.connect(gain);
    gain.connect(audioContext.destination);

    // set eq settings from localstorage
    for (const band of FREQUENCY_BANDS) {
      const filter = this.#frequencyFilters[band];
      filter.gain.value = this.equalizerGainValues()[band];
    }
    eqGain.gain.value = this.baseGain();

    gain.gain.value = this.volume();

    this.#audioElement = audioElement;
    this.#audioContext = audioContext;
    this.#eqGainNode = eqGain;
    this.#gainNode = gain;

    this.#audioElement.addEventListener('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('Audio element error:', error);
      this.#isLoading.set(false);
    });

    this.#audioElement.addEventListener('loadstart', () => {
      this.#isLoading.set(true);
    });

    this.#audioElement.addEventListener('canplay', () => {
      this.#isLoading.set(false);
    });

    // Add event listeners to update signals
    this.#audioElement.addEventListener('timeupdate', () => {
      this.#currentTime.set(this.#audioElement.currentTime);
    });

    this.#audioElement.addEventListener('durationchange', () => {
      this.#duration.set(this.#audioElement.duration);
    });

    this.#audioElement.addEventListener('play', () => {
      this.#sampleRate.set(this.#audioContext.sampleRate);
      this.#isStopped.set(false);
      this.#isPlaying.set(true);
      this.#isPaused.set(false);
    });

    this.#audioElement.addEventListener('pause', () => {
      this.#isPlaying.set(false);
      this.#isPaused.set(true);
    });

    this.#audioElement.addEventListener('ended', () => {
      this.#hasEnded.next();
    });
  }

  /**
  Connects and returns a new analyser node for visualizing the audio output.
  */
  plugInNewAnalyserNode(): AnalyserNode {
    const analyser = this.#audioContext.createAnalyser();
    this.#eqGainNode.connect(analyser);
    this.#connectedAnalyzers.add(analyser);
    return analyser;
  }

  /**
  Disconnects an analyser node previously connected by this service.
  */
  disconnectAnalyserNode(analyser: AnalyserNode): void {
    if (!this.#connectedAnalyzers.has(analyser)) {
      return;
    }

    this.#eqGainNode.disconnect(analyser);
    this.#connectedAnalyzers.delete(analyser);
  }

  /**
  Disconnects every analyser node connected by this service.
  */
  disconnectAllAnalyzers(): void {
    for (const analyser of this.#connectedAnalyzers) {
      this.#eqGainNode.disconnect(analyser);
    }
    this.#connectedAnalyzers.clear();
  }

  /**
  Sets a file as the audio source and revokes the previous blob URL.
  */
  setFileAsSource(file: File) {
    const oldSource = this.#audioElement.src;
    this.#audioElement.src = URL.createObjectURL(file);
    if (oldSource.startsWith('blob:')) {
      URL.revokeObjectURL(oldSource);
    }
  }

  /**
  Resumes the audio context if needed and starts audio playback.
  */
  async play() {
    if (this.#audioContext.state === 'suspended') {
      await this.#audioContext.resume();
    }

    return this.#audioElement.play();
  }

  /**
  Pauses playback when the audio element is currently playing.
  */
  pause() {
    if (this.isPlaying()) {
      this.#audioElement.pause();
    }
  }

  /**
  Pauses playback, seeks to the beginning, and marks audio as stopped.
  */
  stop() {
    if (this.isPlaying()) {
      this.pause();
    }
    this.seekToPosition(0);
    this.#isStopped.set(true);
  }

  /**
  Enables or disables looping on the audio element.
  */
  setLoop(loop: boolean) {
    this.#audioElement.loop = loop;
    this.#isLooping.set(loop);
  }

  /**
  Seeks to a playback position, using the fast-seek API when requested.
  */
  seekToPosition(position: number, fastSeek = false) {
    if (fastSeek && 'fastSeek' in this.#audioElement) {
      this.#audioElement.fastSeek(position);
    } else {
      this.#audioElement.currentTime = position;
    }
  }

  /**
  Returns a cached read-only signal for a frequency band's equalizer gain.
  */
  getFrequencyBandGainSignal(bandFrequency: FrequencyBand): Signal<number> {
    let bandGainSignal = this.#frequencyBandGainSignals.get(bandFrequency);
    if (!bandGainSignal) {
      bandGainSignal = computed(() => this.equalizerGainValues()[bandFrequency]);
      this.#frequencyBandGainSignals.set(bandFrequency, bandGainSignal);
    }
    return bandGainSignal;
  }

  /**
  Sets, persists, and reactively publishes the gain for one frequency band.
  */
  setFrequencyBandGain(bandFrequency: FrequencyBand, gainValue: number) {
    this.#frequencyFilters[bandFrequency].gain.setTargetAtTime(gainValue, this.#audioContext.currentTime, 0.01);

    const bandGains = structuredClone(this.equalizerGainValues());
    bandGains[bandFrequency] = gainValue;

    this.#localStorageService.store('equalizerGainValues', bandGains);
    this.#equalizerGainValues.set(bandGains);
  }

  /**
  Resets one frequency band's equalizer gain to zero.
  */
  resetFrequencyBandGain(bandFrequency: FrequencyBand) {
    this.setFrequencyBandGain(bandFrequency, 0);
  }

  /**
  Sets and persists the output volume when the value is between zero and one.
  */
  setVolume(value: number) {
    if (!(value >= 0 && value <= 1)) {
      return;
    }

    this.#gainNode.gain.setTargetAtTime(value, this.#audioContext.currentTime, 0.01);
    this.#volume.set(value);
    this.#localStorageService.store('volume', value);
  }

  /**
  Sets and persists the equalizer's base gain.
  */
  setBaseGain(volume: number) {
    this.#eqGainNode.gain.setTargetAtTime(volume, this.#audioContext.currentTime, 0.01);
    this.#baseGain.set(volume);
    this.#localStorageService.store('baseGain', volume);
  }
}
