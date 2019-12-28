import {IJobManager} from '../database/interfaces/IJobManager';
import {JobProgressDTO, JobProgressStates} from '../../../common/entities/job/JobProgressDTO';
import {IJob} from './jobs/IJob';
import {JobRepository} from './JobRepository';
import {Config} from '../../../common/config/private/Config';
import {AfterJobTrigger, JobScheduleDTO, JobTriggerType} from '../../../common/entities/job/JobScheduleDTO';
import {Logger} from '../../Logger';
import {NotificationManager} from '../NotifocationManager';
import {IJobListener} from './jobs/IJobListener';
import {JobProgress} from './jobs/JobProgress';
import {JobProgressManager} from './JobProgressManager';


const LOG_TAG = '[JobManager]';

export class JobManager implements IJobManager, IJobListener {
  protected timers: { schedule: JobScheduleDTO, timer: NodeJS.Timeout }[] = [];
  protected progressManager: JobProgressManager = null;

  constructor() {
    this.progressManager = new JobProgressManager();
    this.runSchedules();
  }

  getProgresses(): { [id: string]: JobProgressDTO } {
    return this.progressManager.Running;
  }

  getJobLastRuns(): { [key: string]: JobProgressDTO } {
    return this.progressManager.Finished;
  }

  async run<T>(jobName: string, config: T): Promise<void> {
    const t = this.findJob(jobName);
    if (t) {
      t.JobListener = this;
      await t.start(config);
    } else {
      Logger.warn(LOG_TAG, 'cannot find job to start:' + jobName);
    }
  }

  stop(jobName: string): void {
    const t = this.findJob(jobName);
    if (t) {
      t.cancel();
    } else {
      Logger.warn(LOG_TAG, 'cannot find job to stop:' + jobName);
    }
  }

  onProgressUpdate = (progress: JobProgress): void => {
    this.progressManager.onJobProgressUpdate(progress.toDTO());
  };


  onJobFinished = async (job: IJob<any>, state: JobProgressStates): Promise<void> => {
    if (state !== JobProgressStates.finished) { // if it was not finished peacefully, do not start the next one
      return;
    }
    const sch = Config.Server.Jobs.scheduled.find(s => s.jobName === job.Name);
    if (sch) {
      const children = Config.Server.Jobs.scheduled.filter(s => s.trigger.type === JobTriggerType.after &&
        (<AfterJobTrigger>s.trigger).afterScheduleName === sch.name);
      for (let i = 0; i < children.length; ++i) {
        try {
          await this.run(children[i].jobName, children[i].config);
        } catch (e) {
          NotificationManager.warning('Job running error:' + children[i].name, e.toString());
        }
      }
    }
  };

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

  protected findJob<T = any>(jobName: string): IJob<T> {
    return this.getAvailableJobs().find(t => t.Name === jobName);
  }

  private runSchedule(schedule: JobScheduleDTO) {
    const nextDate = JobScheduleDTO.getNextRunningDate(new Date(), schedule);
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
