import { Pipe, PipeTransform } from '@angular/core';
import { FrequencyBand } from '../player.types';

@Pipe({
  name: 'band',
  pure: true
})
export class BandPipe implements PipeTransform {
  transform(value: FrequencyBand): string {
    if (!value || value < 0) {
      return '';
    }

    if (value >= 1000) {
      const kValue = value / 1000;
      return kValue % 1 === 0 ? `${Math.floor(kValue)}K` : `${kValue.toFixed(1)}K`;
    }

    return value.toString();
  }
}
