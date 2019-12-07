import {ITaskManager} from '../interfaces/ITaskManager';
import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {ITask} from './ITask';
import {TaskRepository} from './TaskRepository';
import {Config} from '../../../common/config/private/Config';
import {TaskScheduleDTO, TaskTriggerType} from '../../../common/entities/task/TaskScheduleDTO';
import {Logger} from '../../Logger';

const LOG_TAG = '[TaskManager]';

export class TaskManager implements ITaskManager {

  protected timers: NodeJS.Timeout[] = [];

  constructor() {
    this.runSchedules();
  }

  getProgresses(): { [id: string]: TaskProgressDTO } {
    const m: { [id: string]: TaskProgressDTO } = {};
    TaskRepository.Instance.getAvailableTasks()
      .filter(t => t.Progress)
      .forEach(t => m[t.Name] = t.Progress);
    return m;
  }

  start<T>(taskName: string, config: T): void {
    const t = this.findTask(taskName);
    if (t) {
      t.start(config);
    } else {
      Logger.warn(LOG_TAG, 'cannot find task to start:' + taskName);
    }
  }

  stop(taskName: string): void {
    const t = this.findTask(taskName);
    if (t) {
      t.stop();
      if (global.gc) {
        global.gc();
      }
    } else {
      Logger.warn(LOG_TAG, 'cannot find task to stop:' + taskName);
    }
  }

  getAvailableTasks(): ITask<any>[] {
    return TaskRepository.Instance.getAvailableTasks();
  }

  public stopSchedules(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  public runSchedules(): void {
    this.stopSchedules();
    Logger.info(LOG_TAG, 'Running task schedules');
    Config.Server.tasks.scheduled.forEach(schedule => {
      const nextDate = this.getDateFromSchedule(new Date(), schedule);
      if (nextDate && nextDate.getTime() > Date.now()) {
        Logger.debug(LOG_TAG, 'running schedule: ' + schedule.taskName +
          ' at ' + nextDate.toLocaleString(undefined, {hour12: false}));

        const timer: NodeJS.Timeout = setTimeout(() => {
          this.start(schedule.taskName, schedule.config);
          this.timers = this.timers.filter(t => t !== timer);
        }, nextDate.getTime() - Date.now());
        this.timers.push(timer);

      } else {
        Logger.debug(LOG_TAG, 'skipping schedule:' + schedule.taskName);
      }

    });
  }

  protected getDateFromSchedule(refDate: Date, schedule: TaskScheduleDTO): Date {
    switch (schedule.trigger.type) {
      case TaskTriggerType.scheduled:
        return new Date(schedule.trigger.time);

      case TaskTriggerType.periodic:
        const nextValidHM = (date: Date, h: number, m: number, dayDiff: number): Date => {

          if (date.getHours() < h || (date.getHours() === h && date.getMinutes() <= m)) {
            date.setHours(h);
            date.setMinutes(m);
          } else {
            date.setTime(date.getTime() + dayDiff);
            date.setHours(h);
            date.setMinutes(m);
          }
          return date;
        };

        const getNextDayOfTheWeek = (dayOfWeek: number, h: number, m: number): Date => {
          const date = new Date(refDate);
          date.setDate(refDate.getDate() + (dayOfWeek + 1 + 7 - refDate.getDay()) % 7);
          if (date.getDay() === refDate.getDay()) {
            return new Date(refDate);
          }
          date.setHours(0, 0, 0, 0);
          return date;
        };


        const hour = Math.floor(schedule.trigger.atTime / 1000 / (60 * 60));
        const minute = (schedule.trigger.atTime / 1000 / 60) % 60;

        if (schedule.trigger.periodicity <= 6) { // Between Monday and Sunday
          const nextRunDate = getNextDayOfTheWeek(schedule.trigger.periodicity, hour, minute);
          return nextValidHM(nextRunDate, hour, minute, 7 * 24 * 60 * 60 * 1000);
        }

        // every day
        return nextValidHM(new Date(refDate), hour, minute, 24 * 60 * 60 * 1000);
    }
    return null;
  }

  protected findTask<T = any>(taskName: string): ITask<T> {
    return this.getAvailableTasks().find(t => t.Name === taskName);
  }

}
