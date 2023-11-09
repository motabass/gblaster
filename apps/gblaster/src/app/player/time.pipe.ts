import { Pipe, PipeTransform } from '@angular/core';
import { formatSecondsAsClock } from '@motabass/helpers';

@Pipe({
  name: 'time',
  pure: true,
  standalone: true
})
export class TimePipe implements PipeTransform {
  transform(value: number | undefined, ...args: unknown[]): string {
    return formatSecondsAsClock(value);
  }
}
