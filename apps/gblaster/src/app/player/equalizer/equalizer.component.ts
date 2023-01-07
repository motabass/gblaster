import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { BAND_FREQUENIES } from '../player.service';
import { FrequencyBand } from '../player.types';
import { AudioService } from '../audio.service';

@Component({
  selector: 'mtb-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss']
})
export class EqualizerComponent {
  constructor(private audioService: AudioService) {}

  get BANDS(): FrequencyBand[] {
    return BAND_FREQUENIES;
  }

  getBandGain(bandFrequency: FrequencyBand): number {
    return this.audioService.getBandGain(bandFrequency);
  }

  onGainChange(event: MatSliderChange, frequencyBand: FrequencyBand) {
    if (event.value) {
      this.audioService.setGainForFrequency(frequencyBand, event.value);
    }
  }

  displayFunction(value: number): string {
    return value <= 0 ? value.toString() : '+' + value;
  }

  bandTrackFunction(index: number): number {
    return index;
  }

  getBaseGain() {
    return this.audioService.baseGain;
  }

  onBaseGainChange(event: MatSliderChange) {
    if (event.value) {
      this.audioService.setBaseGain(event.value);
    }
  }
}
