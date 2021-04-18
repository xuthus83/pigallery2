import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-timestamp-timepicker',
  templateUrl: './timepicker.component.html',
})
export class TimeStampTimePickerComponent {

  timestampValue = 0;
  timezoneOffset = (new Date()).getTimezoneOffset() * 60 * 1000;
  @Output() timestampChange = new EventEmitter<number>();

  date: Date = new Date();

  @Input() name: string;

  @Input()
  public get timestamp(): number {
    return this.timestampValue;
  }

  public set timestamp(val: number) {
    this.date.setTime(val + this.timezoneOffset);
    if (this.timestampValue === val) {
      return;
    }
    this.timestampValue = val;
    this.timestampChange.emit(this.timestampValue);
  }

  onChange(date: Date | string): void {
    this.timestamp = (new Date(date)).getTime() - this.timezoneOffset;
  }


}



