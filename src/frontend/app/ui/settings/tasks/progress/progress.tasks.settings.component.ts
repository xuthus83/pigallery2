import {Component, Input} from '@angular/core';
import {TaskProgressDTO, TaskState} from '../../../../../../common/entities/settings/TaskProgressDTO';

@Component({
  selector: 'app-settings-tasks-progress',
  templateUrl: './progress.tasks.settings.component.html',
  styleUrls: ['./progress.tasks.settings.component.css']
})
export class TasksProgressComponent {

  @Input() progress: TaskProgressDTO;
  TaskState = TaskState;

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
    return (this.progress.time.current - this.progress.time.start);
  }

}



