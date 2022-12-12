import { Injectable } from '@angular/core';
import { action } from 'mobx-angular';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { FrequencyBand } from './player.types';

const FREQUENCY_BANDS: FrequencyBand[] = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

@Injectable({ providedIn: 'root' })
export class AudioService {
  private frequencyBandFilters: { [band: number]: BiquadFilterNode } = {};
  @LocalStorage('equalizerGainValues', { 60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0 })
  private equalizerGainValues!: {
    [band: number]: number;
  };
  private audioContext: AudioContext;
  private gainNode: GainNode;
  analyserNode: AnalyserNode;
  audioElement: HTMLAudioElement;

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
    document.body.appendChild(audioElement);

    // initialize audio context
    const audioContext = new AudioContext({
      latencyHint: 'playback'
    });

    // create audio nodes
    const audioSource = audioContext.createMediaElementSource(audioElement);
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    const { eqInput, eqOutput } = this.createEqualizer(audioContext);

    // connect audio nodes
    audioSource.connect(analyser);
    analyser.connect(eqInput);
    eqOutput.connect(gain);
    gain.connect(audioContext.destination);

    // set eq settings from localstorage
    for (const frequencyBand of FREQUENCY_BANDS) {
      const filter = this.frequencyBandFilters[frequencyBand];
      filter.gain.value = this.equalizerGainValues[frequencyBand];
    }

    // set volume setting from localstorage
    const storedVolume = this.storageService.retrieve('volume');
    gain.gain.value = storedVolume ?? 0.5;

    this.audioElement = audioElement;
    this.audioContext = audioContext;
    this.analyserNode = analyser;
    this.gainNode = gain;
  }

  private createEqualizer(audioContext: AudioContext): { eqInput: AudioNode; eqOutput: AudioNode } {
    const input = audioContext.createGain();
    input.gain.value = 1;

    let output = input;
    for (const [i, bandFrequency] of FREQUENCY_BANDS.entries()) {
      const filter = audioContext.createBiquadFilter();

      this.frequencyBandFilters[bandFrequency] = filter;

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

  getBandGain(bandFrequency: FrequencyBand): number {
    return this.equalizerGainValues[bandFrequency];
  }

  @action setGainForFrequency(bandFrequency: FrequencyBand, gainValue: number) {
    this.frequencyBandFilters[bandFrequency].gain.value = gainValue;

    const bandGains = this.equalizerGainValues;
    bandGains[bandFrequency] = gainValue;
    this.equalizerGainValues = bandGains;
  }

  @action setVolume(value: number) {
    if (value >= 0 && value <= 1) {
      this.storageService.store('volume', value);
      this.gainNode.gain.value = value;
    }
  }

  get volume() {
    return this.gainNode.gain.value;
  }

  get playing(): boolean {
    return !this.audioElement.paused;
  }
}
