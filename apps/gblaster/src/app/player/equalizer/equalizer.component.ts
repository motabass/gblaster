import { Component } from '@angular/core';
import { BAND_FREQUENIES } from '../player.service';
import { FrequencyBand } from '../player.types';
import { AudioService } from '../audio.service';
import { BandPipe } from './band.pipe';
import { MatSliderModule } from '@angular/material/slider';
import { NgFor } from '@angular/common';

@Component({
  selector: 'mtb-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss'],
  standalone: true,
  imports: [NgFor, MatSliderModule, BandPipe]
})
export class EqualizerComponent {
  constructor(private audioService: AudioService) {}

  get BANDS(): FrequencyBand[] {
    return BAND_FREQUENIES;
  }

  getBandGain(bandFrequency: FrequencyBand): number {
    return this.audioService.getBandGain(bandFrequency);
  }

  onGainChange(value: number, frequencyBand: FrequencyBand) {
    if (value !== undefined && value !== null) {
      this.audioService.setGainForFrequency(frequencyBand, value);
    }
  }

  displayFunction(value: number): string {
    const num = value.toFixed(1);
    return num + ' dB';
  }

  bandTrackFunction(index: number): number {
    return index;
  }

  getBaseGain() {
    return this.audioService.baseGain;
  }

  onBaseGainChange(value: number) {
    if (value !== undefined && value !== null) {
      this.audioService.setBaseGain(value);
    }
  }
}
