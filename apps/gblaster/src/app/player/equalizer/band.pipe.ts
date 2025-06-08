import { Pipe, PipeTransform } from '@angular/core';
import { FrequencyBand } from '../player.types';

@Pipe({
  name: 'band',
  pure: true
})
export class BandPipe implements PipeTransform {
  transform(value: FrequencyBand, ...arguments_: unknown[]): string {
    if (!value) {
      return '';
    }

    if (value < 1000) {
      return value.toString();
    } else if (value >= 1000 && value < 10_000) {
      return value.toString().slice(0, 1) + 'K';
    } else if (value >= 10_000) {
      return value.toString().slice(0, 2) + 'K';
    }

    return value.toString();
  }
}
