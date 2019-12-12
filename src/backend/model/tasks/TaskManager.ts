import {ITaskManager} from '../interfaces/ITaskManager';
import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {ITask} from './tasks/ITask';
import {TaskRepository} from './TaskRepository';
import {Config} from '../../../common/config/private/Config';
import {TaskScheduleDTO, TaskTriggerType} from '../../../common/entities/task/TaskScheduleDTO';
import {Logger} from '../../Logger';

declare var global: NodeJS.Global;

const LOG_TAG = '[TaskManager]';

export class TaskManager implements ITaskManager {

  protected timers: { schedule: TaskScheduleDTO, timer: NodeJS.Timeout }[] = [];

  constructor() {
    this.runSchedules();
  }

  getProgresses(): { [id: string]: TaskProgressDTO } {
    const m: { [id: string]: TaskProgressDTO } = {};
    TaskRepository.Instance.getAvailableTasks()
      .filter(t => t.Progress)
      .forEach(t => {
        t.Progress.time.current = Date.now();
        m[t.Name] = t.Progress;
      });
    return m;
  }

  async run<T>(taskName: string, config: T): Promise<void> {
    const t = this.findTask(taskName);
    if (t) {
      await t.start(config);
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
    this.timers.forEach(t => clearTimeout(t.timer));
    this.timers = [];
  }

  public runSchedules(): void {
    this.stopSchedules();
    Logger.info(LOG_TAG, 'Running task schedules');
    Config.Server.Tasks.scheduled.forEach(s => this.runSchedule(s));
  }

  protected getNextDayOfTheWeek(refDate: Date, dayOfWeek: number) {
    const date = new Date(refDate);
    date.setDate(refDate.getDate() + (dayOfWeek + 1 + 7 - refDate.getDay()) % 7);
    if (date.getDay() === refDate.getDay()) {
      return new Date(refDate);
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  protected nextValidDate(date: Date, h: number, m: number, dayDiff: number): Date {

    date.setSeconds(0);
    if (date.getHours() < h || (date.getHours() === h && date.getMinutes() < m)) {
      date.setHours(h);
      date.setMinutes(m);
    } else {
      date.setTime(date.getTime() + dayDiff);
      date.setHours(h);
      date.setMinutes(m);
    }
    return date;
  }

  protected getDateFromSchedule(refDate: Date, schedule: TaskScheduleDTO): Date {
    switch (schedule.trigger.type) {
      case TaskTriggerType.scheduled:
        return new Date(schedule.trigger.time);

      case TaskTriggerType.periodic:


        const hour = Math.floor(schedule.trigger.atTime / 1000 / (60 * 60));
        const minute = (schedule.trigger.atTime / 1000 / 60) % 60;

        if (schedule.trigger.periodicity <= 6) { // Between Monday and Sunday
          const nextRunDate = this.getNextDayOfTheWeek(refDate, schedule.trigger.periodicity);
          return this.nextValidDate(nextRunDate, hour, minute, 7 * 24 * 60 * 60 * 1000);
        }

        // every day
        return this.nextValidDate(new Date(refDate), hour, minute, 24 * 60 * 60 * 1000);
    }
    return null;
  }

  protected findTask<T = any>(taskName: string): ITask<T> {
    return this.getAvailableTasks().find(t => t.Name === taskName);
  }

  private runSchedule(schedule: TaskScheduleDTO) {
    const nextDate = this.getDateFromSchedule(new Date(), schedule);
    if (nextDate && nextDate.getTime() > Date.now()) {
      Logger.debug(LOG_TAG, 'running schedule: ' + schedule.taskName +
        ' at ' + nextDate.toLocaleString(undefined, {hour12: false}));

      const timer: NodeJS.Timeout = setTimeout(async () => {
        this.timers = this.timers.filter(t => t.timer !== timer);
        await this.run(schedule.taskName, schedule.config);
        this.runSchedule(schedule);
      }, nextDate.getTime() - Date.now());
      this.timers.push({schedule: schedule, timer: timer});

    } else {
      Logger.debug(LOG_TAG, 'skipping schedule:' + schedule.taskName);
    }
  }

}
