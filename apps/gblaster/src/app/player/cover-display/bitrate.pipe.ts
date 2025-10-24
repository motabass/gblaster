import { Pipe, PipeTransform } from '@angular/core';
import { formatBitrate } from './bitrate-helper';

@Pipe({
  name: 'bitrate',
  pure: true
})
export class BitratePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatBitrate(value);
  }
}
