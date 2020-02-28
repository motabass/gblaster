import { Pipe, PipeTransform } from '@angular/core';
import { BandFrequency } from '../player.types';

@Pipe({
  name: 'band',
  pure: true
})
export class BandPipe implements PipeTransform {
  transform(value: BandFrequency, ...args: unknown[]): string {
    if (!value) {
      return '';
    }

    if (value < 1000) {
      return value.toString();
    } else if (value >= 1000 && value < 10000) {
      return value.toString().substr(0, 1) + 'K';
    } else if (value >= 10000) {
      return value.toString().substr(0, 2) + 'K';
    }

    return value.toString();
  }
}
