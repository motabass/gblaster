import { Component, inject } from '@angular/core';
import { BAND_FREQUENCIES } from '../player.service';
import { FrequencyBand } from '../player.types';
import { AudioService } from '../audio.service';
import { BandPipe } from './band.pipe';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'mtb-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrl: './equalizer.component.scss',
  imports: [MatSliderModule, BandPipe]
})
export default class EqualizerComponent {
  private audioService = inject(AudioService);

  BANDS = BAND_FREQUENCIES;
  getBandGain(bandFrequency: FrequencyBand): number {
    return this.audioService.getBandGain(bandFrequency);
  }

  onGainChange(value: number, frequencyBand: FrequencyBand) {
    if (value !== undefined && value !== null) {
      this.audioService.setGainForFrequency(frequencyBand, value);
    }
  }

  displayFunction(value: number): string {
    const number_ = value.toFixed(1);
    return number_ + ' dB';
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
