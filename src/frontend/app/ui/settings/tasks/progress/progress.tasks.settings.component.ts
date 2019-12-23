import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {TaskProgressDTO, TaskState} from '../../../../../../common/entities/settings/TaskProgressDTO';
import {Subscription, timer} from 'rxjs';

@Component({
  selector: 'app-settings-tasks-progress',
  templateUrl: './progress.tasks.settings.component.html',
  styleUrls: ['./progress.tasks.settings.component.css']
})
export class TasksProgressComponent implements OnDestroy, OnChanges {

  @Input() progress: TaskProgressDTO;
  TaskState = TaskState;
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



