import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {JobProgressDTO, JobState} from '../../../../../../common/entities/settings/JobProgressDTO';
import {Subscription, timer} from 'rxjs';

@Component({
  selector: 'app-settings-job-progress',
  templateUrl: './job-progress.settings.component.html',
  styleUrls: ['./job-progress.settings.component.css']
})
export class JobProgressComponent implements OnDestroy, OnChanges {

  @Input() progress: JobProgressDTO;
  JobState = JobState;
  timeCurrentCopy: number;
  private timerSub: Subscription;

  constructor() {
  }

  get TimeAll(): number {
    if (!this.progress) {
      return 0;
    }
    return (this.progress.time.current - this.progress.time.start) /
      this.progress.progress * (this.progress.left + this.progress.progress);
  }

  get TimeLeft(): number {
    if (!this.progress) {
      return 0;
    }
    return (this.progress.time.current - this.progress.time.start) / this.progress.progress * this.progress.left;
  }

  get TimeElapsed() {
    if (!this.progress) {
      return 0;
    }
    return (this.timeCurrentCopy - this.progress.time.start);
  }

  ngOnChanges(): void {
    if (!this.progress) {
      return;
    }
    this.timeCurrentCopy = this.progress.time.current;
    if (!this.timerSub) {
      this.timerSub = timer(0, 1000).subscribe(() => {
        if (this.progress) {
          this.timeCurrentCopy += 1000;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }


}



