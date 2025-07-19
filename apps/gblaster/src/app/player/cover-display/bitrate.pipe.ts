import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bitrate',
  pure: true
})
export class BitratePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || value <= 0 || !Number.isFinite(value)) {
      return '0 kb/s';
    }

    const bitrate = Math.round(value / 1000);
    return `${bitrate} kb/s`;
  }
}
