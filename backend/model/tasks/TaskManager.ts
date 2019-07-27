import {ITaskManager} from '../interfaces/ITaskManager';
import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {ITask} from './ITask';
import {TaskRepository} from './TaskRepository';
import {Config} from '../../../common/config/private/Config';

export class TaskManager implements ITaskManager {


  getProgresses(): { [id: string]: TaskProgressDTO } {
    const m: { [id: string]: TaskProgressDTO } = {};
    TaskRepository.Instance.getAvailableTasks().forEach(t => m[t.Name] = t.Progress);
    return m;
  }

  start(taskName: string, config: any): void {
    const t = this.findTask(taskName);
    if (t) {
      t.start(config);
    }
  }

  stop(taskName: string): void {
    const t = this.findTask(taskName);
    if (t) {
      t.stop();
    }
  }

  getAvailableTasks(): ITask<any>[] {
    return TaskRepository.Instance.getAvailableTasks();
  }


  protected findTask(taskName: string): ITask<any> {
    return this.getAvailableTasks().find(t => t.Name === taskName);

  }

}
