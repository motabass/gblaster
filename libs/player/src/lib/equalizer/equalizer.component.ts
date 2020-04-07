import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { BAND_FREQUENIES, PlayerService } from '../player.service';
import { BandFrequency } from '../player.types';

@Component({
  selector: 'mtb-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss']
})
export class EqualizerComponent {
  constructor(private playerService: PlayerService) {}

  get BANDS(): BandFrequency[] {
    return BAND_FREQUENIES;
  }

  getBandGain(bandFrequency: BandFrequency): number {
    return this.playerService.getBandGain(bandFrequency);
  }

  onGainChange(event: MatSliderChange, bandFrequency: BandFrequency) {
    if (event.value) {
      this.playerService.bands[bandFrequency].gain.value = event.value;
      this.playerService.setBandGain(bandFrequency, event.value);
    }
  }

  displayFunction(value: any) {
    if (value <= 0) {
      return value;
    }
    if (value > 0) {
      return '+' + value;
    }
  }

  bandTrackFunction(index: number): number {
    return index;
  }
}
