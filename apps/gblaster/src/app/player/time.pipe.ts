import { Pipe, PipeTransform } from '@angular/core';
import { formatSecondsAsClock } from '@motabass/helpers';

@Pipe({
  name: 'time',
  pure: true
})
export class TimePipe implements PipeTransform {
  transform(value: number | undefined): string {
    return formatSecondsAsClock(value);
  }
}
