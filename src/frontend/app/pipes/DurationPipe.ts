import {Pipe, PipeTransform} from '@angular/core';
import {I18n} from '@ngx-translate/i18n-polyfill';


@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {
  constructor(private i18n: I18n) {
  }

  transform(time: number, separator: ':' | 'string' = 'string'): string {
    const h = Math.floor(time / 1000 / 60 / 60);
    time %= 1000 * 60 * 60;
    const m = Math.floor(time / 1000 / 60);
    time %= 1000 * 60;
    const s = Math.floor(time / 1000);


    if (separator === ':') {
      const leftPad = (x: any): string => String(x).length >= 2 ? x : leftPad(`0${x}`);
      return [h || 0, m || 0, s || 0].map(leftPad).join(':');
    }
    let str = '';
    if (h > 0) {
      str += h + this.i18n({value: 'h', meaning: 'hour'});
    }
    if (m > 0) {
      str += m + this.i18n({value: 'm', meaning: 'minute'});
    }
    if (s > 0) {
      str += s + this.i18n({value: 's', meaning: 'second'});
    }

    return str;
  }
}

