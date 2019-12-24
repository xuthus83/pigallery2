import {IJobManager} from '../database/interfaces/IJobManager';
import {JobProgressDTO} from '../../../common/entities/settings/JobProgressDTO';
import {IJob} from './jobs/IJob';
import {JobRepository} from './JobRepository';
import {Config} from '../../../common/config/private/Config';
import {JobScheduleDTO, JobTriggerType} from '../../../common/entities/job/JobScheduleDTO';
import {Logger} from '../../Logger';

declare var global: NodeJS.Global;

const LOG_TAG = '[JobManager]';

export class JobManager implements IJobManager {

  protected timers: { schedule: JobScheduleDTO, timer: NodeJS.Timeout }[] = [];

  constructor() {
    this.runSchedules();
  }

  getProgresses(): { [id: string]: JobProgressDTO } {
    const m: { [id: string]: JobProgressDTO } = {};
    JobRepository.Instance.getAvailableJobs()
      .filter(t => t.Progress)
      .forEach(t => {
        t.Progress.time.current = Date.now();
        m[t.Name] = t.Progress;
      });
    return m;
  }

  async run<T>(jobName: string, config: T): Promise<void> {
    const t = this.findJob(jobName);
    if (t) {
      await t.start(config);
    } else {
      Logger.warn(LOG_TAG, 'cannot find job to start:' + jobName);
    }
  }

  stop(jobName: string): void {
    const t = this.findJob(jobName);
    if (t) {
      t.stop();
      if (global.gc) {
        global.gc();
      }
    } else {
      Logger.warn(LOG_TAG, 'cannot find job to stop:' + jobName);
    }
  }

  getAvailableJobs(): IJob<any>[] {
    return JobRepository.Instance.getAvailableJobs();
  }

  public stopSchedules(): void {
    this.timers.forEach(t => clearTimeout(t.timer));
    this.timers = [];
  }

  public runSchedules(): void {
    this.stopSchedules();
    Logger.info(LOG_TAG, 'Running job schedules');
    Config.Server.Jobs.scheduled.forEach(s => this.runSchedule(s));
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

  protected getDateFromSchedule(refDate: Date, schedule: JobScheduleDTO): Date {
    switch (schedule.trigger.type) {
      case JobTriggerType.scheduled:
        return new Date(schedule.trigger.time);

      case JobTriggerType.periodic:


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

  protected findJob<T = any>(jobName: string): IJob<T> {
    return this.getAvailableJobs().find(t => t.Name === jobName);
  }

  private runSchedule(schedule: JobScheduleDTO) {
    const nextDate = this.getDateFromSchedule(new Date(), schedule);
    if (nextDate && nextDate.getTime() > Date.now()) {
      Logger.debug(LOG_TAG, 'running schedule: ' + schedule.jobName +
        ' at ' + nextDate.toLocaleString(undefined, {hour12: false}));

      const timer: NodeJS.Timeout = setTimeout(async () => {
        this.timers = this.timers.filter(t => t.timer !== timer);
        await this.run(schedule.jobName, schedule.config);
        this.runSchedule(schedule);
      }, nextDate.getTime() - Date.now());
      this.timers.push({schedule: schedule, timer: timer});

    } else {
      Logger.debug(LOG_TAG, 'skipping schedule:' + schedule.jobName);
    }
  }

}
