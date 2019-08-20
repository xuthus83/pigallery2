import {ITaskManager} from '../interfaces/ITaskManager';
import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {ITask} from './ITask';
import {TaskRepository} from './TaskRepository';
import {Config} from '../../../common/config/private/Config';
import {TaskTriggerType} from '../../../common/entities/task/TaskScheduleDTO';

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

  public runSchedules(): void {
    Config.Server.tasks.scheduled.forEach(schedule => {
      let nextRun = null;
      switch (schedule.trigger.type) {
        case TaskTriggerType.scheduled:
          nextRun = Date.now() - schedule.trigger.time;
          break;
        /*case TaskTriggerType.periodic:

          //TODo finish it
          const getNextDayOfTheWeek = (dayOfWeek: number) => {
            const refDate = new Date();
            refDate.setHours(0, 0, 0, 0);
            refDate.setDate(refDate.getDate()  + (dayOfWeek + 7 - refDate.getDay()) % 7);
            return refDate;
          };

          nextRun = Date.now() - schedule.trigger.periodicity;
          break;*/
      }

      if (nextRun != null) {
        setTimeout(() => {
          this.start(schedule.taskName, schedule.config);
        }, nextRun);
      }
    });
  }

  protected findTask(taskName: string): ITask<any> {
    return this.getAvailableTasks().find(t => t.Name === taskName);

  }

}
