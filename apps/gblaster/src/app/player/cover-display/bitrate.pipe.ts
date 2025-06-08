import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bitrate'
})
export class BitratePipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (!value) {
      return '0';
    }
    const bitrate = Math.round(value / 1000);
    return `${bitrate} kb/s`;
  }
}
