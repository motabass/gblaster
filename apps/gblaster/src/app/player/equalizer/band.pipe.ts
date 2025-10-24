import { Pipe, PipeTransform } from '@angular/core';
import { FrequencyBand } from '../player.types';
import { formatFrequencyBand } from './band-helper';

@Pipe({
  name: 'band',
  pure: true
})
export class BandPipe implements PipeTransform {
  transform(value: FrequencyBand): string {
    return formatFrequencyBand(value);
  }
}
