import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {JobProgressDTO, JobProgressStates} from '../../../../../../common/entities/job/JobProgressDTO';
import {Subscription, timer} from 'rxjs';

@Component({
  selector: 'app-settings-job-progress',
  templateUrl: './job-progress.settings.component.html',
  styleUrls: ['./job-progress.settings.component.css']
})
export class JobProgressComponent implements OnDestroy, OnChanges {

  @Input() progress: JobProgressDTO;
  @Input() lastRun: JobProgressDTO;
  JobProgressStates = JobProgressStates;
  timeCurrentCopy: number;
  private timerSub: Subscription;

  constructor() {
  }

  get TimeAll(): number {
    if (!this.progress) {
      return 0;
    }
    return (this.progress.time.end - this.progress.time.start) /
      (this.progress.steps.processed + this.progress.steps.skipped) * this.progress.steps.all;
  }

  get TimeLeft(): number {
    if (!this.progress) {
      return 0;
    }
    return (this.progress.time.end - this.progress.time.start) / this.progress.steps.all;
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
    this.timeCurrentCopy = this.progress.time.end;
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



