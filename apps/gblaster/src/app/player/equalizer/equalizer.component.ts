import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AudioService, FREQUENCY_BANDS } from '../audio.service';
import { BandPipe } from './band.pipe';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'mtb-equalizer',
  templateUrl: './equalizer.component.html',
  styleUrl: './equalizer.component.scss',
  imports: [MatSliderModule, BandPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class EqualizerComponent {
  audioService = inject(AudioService);

  BANDS = FREQUENCY_BANDS;

  displayFunction(value: number): string {
    const number_ = value.toFixed(1);
    return number_ + ' dB';
  }
}
