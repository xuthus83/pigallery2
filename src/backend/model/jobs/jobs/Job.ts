import {JobProgressDTO, JobState} from '../../../../common/entities/settings/JobProgressDTO';
import {Logger} from '../../../Logger';
import {IJob} from './IJob';
import {ConfigTemplateEntry, JobDTO} from '../../../../common/entities/job/JobDTO';

declare const process: any;

const LOG_TAG = '[JOB]';

export abstract class Job<T = void> implements IJob<T> {

  protected progress: JobProgressDTO = null;
  protected state = JobState.idle;
  protected config: T;
  protected prResolve: () => void;
  protected IsInstant = false;


  public abstract get Supported(): boolean;

  public abstract get Name(): string;


  public abstract get ConfigTemplate(): ConfigTemplateEntry[];


  public get Progress(): JobProgressDTO {
    return this.progress;
  }

  public start(config: T): Promise<void> {
    if (this.state === JobState.idle && this.Supported) {
      Logger.info(LOG_TAG, 'Running job: ' + this.Name);
      this.config = config;
      this.progress = {
        progress: 0,
        left: 0,
        comment: '',
        state: JobState.running,
        time: {
          start: Date.now(),
          current: Date.now()
        }
      };
      const pr = new Promise<void>((resolve) => {
        this.prResolve = resolve;
      });
      this.init().catch(console.error);
      this.state = JobState.running;
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

  public stop(): void {
    Logger.info(LOG_TAG, 'Stopping job: ' + this.Name);
    this.state = JobState.stopping;
    this.progress.state = JobState.stopping;
  }

  public toJSON(): JobDTO {
    return {
      Name: this.Name,
      ConfigTemplate: this.ConfigTemplate
    };
  }

  protected abstract async step(): Promise<JobProgressDTO>;

  protected abstract async init(): Promise<void>;

  private onFinish(): void {
    this.progress = null;
    Logger.info(LOG_TAG, 'Job finished: ' + this.Name);
    if (this.IsInstant) {
      this.prResolve();
    }
  }

  private run() {
    process.nextTick(async () => {
      try {
        if (this.state === JobState.idle) {
          this.progress = null;
          return;
        }
        this.progress = await this.step();
        if (this.progress == null) { // finished
          this.state = JobState.idle;
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
