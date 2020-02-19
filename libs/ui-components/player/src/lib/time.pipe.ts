import { Pipe, PipeTransform } from '@angular/core';
import { formatSecondsAsClock } from '@motabass/helpers/time';

@Pipe({
  name: 'time',
  pure: true
})
export class TimePipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): string {
    return formatSecondsAsClock(value);
  }
}
