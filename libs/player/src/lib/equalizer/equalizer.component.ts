import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { BANDS, PlayerService } from '../player.service';

@Component({
  selector: 'mtb-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrls: ['./equalizer.component.scss']
})
export class EqualizerComponent implements OnInit {
  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {}

  get BANDS(): number[] {
    return BANDS;
  }

  get bands(): { [band: number]: BiquadFilterNode } {
    return this.playerService.bands;
  }

  onEqualizerBandChange(event: MatSliderChange, band: number) {
    if (event.value) {
      this.bands[band].gain.value = event.value * 24 - 12;
    }
  }
}
