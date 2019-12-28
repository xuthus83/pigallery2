import {Logger} from '../../../Logger';
import {IJob} from './IJob';
import {ConfigTemplateEntry, JobDTO} from '../../../../common/entities/job/JobDTO';
import {JobProgress} from './JobProgress';
import {IJobListener} from './IJobListener';
import {JobProgressStates} from '../../../../common/entities/job/JobProgressDTO';

declare const process: any;
declare const global: any;

const LOG_TAG = '[JOB]';

export abstract class Job<T = void> implements IJob<T> {
  protected progress: JobProgress = null;
  protected config: T;
  protected prResolve: () => void;
  protected IsInstant = false;
  private jobListener: IJobListener;

  public set JobListener(value: IJobListener) {
    this.jobListener = value;
  }

  public abstract get Supported(): boolean;

  public abstract get Name(): string;

  public abstract get ConfigTemplate(): ConfigTemplateEntry[];


  public get Progress(): JobProgress {
    return this.progress;
  }

  public get CanRun() {
    return this.Progress == null && this.Supported;
  }

  public start(config: T): Promise<void> {
    if (this.CanRun) {
      Logger.info(LOG_TAG, 'Running job: ' + this.Name);
      this.config = config;
      this.progress = new JobProgress(JobDTO.getHashName(this.Name, this.config));
      this.progress.OnChange = this.jobListener.onProgressUpdate;
      const pr = new Promise<void>((resolve) => {
        this.prResolve = resolve;
      });
      this.init().catch(console.error);
      this.run();
      if (!this.IsInstant) { // if instant, wait for execution, otherwise, return right away
        return Promise.resolve();
      }
      return pr;
    } else {
      Logger.info(LOG_TAG, 'Job already running: ' + this.Name);
      return Promise.reject();
    }
  }

  public cancel(): void {
    Logger.info(LOG_TAG, 'Stopping job: ' + this.Name);
    this.Progress.State = JobProgressStates.cancelling;
  }

  public toJSON(): JobDTO {
    return {
      Name: this.Name,
      ConfigTemplate: this.ConfigTemplate
    };
  }


  protected abstract async step(): Promise<boolean>;

  protected abstract async init(): Promise<void>;

  private onFinish(): void {
    if (this.Progress.State === JobProgressStates.running) {
      this.Progress.State = JobProgressStates.finished;
    }
    if (this.Progress.State === JobProgressStates.cancelling) {
      this.Progress.State = JobProgressStates.canceled;
    }
    const finishState = this.Progress.State;
    this.progress = null;
    if (global.gc) {
      global.gc();
    }
    Logger.info(LOG_TAG, 'Job finished: ' + this.Name);
    if (this.IsInstant) {
      this.prResolve();
    }
    this.jobListener.onJobFinished(this, finishState);
  }

  private run() {
    process.nextTick(async () => {
      try {
        if (this.Progress == null || this.Progress.State !== JobProgressStates.running) {
          return;
        }
        if (await this.step() === false) { // finished
          this.onFinish();
          return;
        }
        this.run();
      } catch (e) {
        Logger.error(LOG_TAG, e);
      }
    });
  }
}
