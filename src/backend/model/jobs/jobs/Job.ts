import {JobProgressDTO, JobState} from '../../../../common/entities/job/JobProgressDTO';
import {Logger} from '../../../Logger';
import {IJob} from './IJob';
import {ConfigTemplateEntry, JobDTO} from '../../../../common/entities/job/JobDTO';
import {JobLastRunDTO, JobLastRunState} from '../../../../common/entities/job/JobLastRunDTO';

declare const process: any;
declare const global: any;

const LOG_TAG = '[JOB]';

export abstract class Job<T = void> implements IJob<T> {

  protected progress: JobProgressDTO = null;
  protected state = JobState.idle;
  protected config: T;
  protected prResolve: () => void;
  protected IsInstant = false;
  protected lastRuns: { [key: string]: JobLastRunDTO } = {};

  public abstract get Supported(): boolean;

  public abstract get Name(): string;

  public abstract get ConfigTemplate(): ConfigTemplateEntry[];

  public get LastRuns(): { [key: string]: JobLastRunDTO } {
    return this.lastRuns;
  }

  public get Progress(): JobProgressDTO {
    return this.progress;
  }

  public start(config: T, onFinishCB: (status: JobLastRunState) => void): Promise<void> {
    this.OnFinishCB = onFinishCB;
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
      this.lastRuns[JSON.stringify(this.config)] = {
        all: 0,
        done: 0,
        comment: '',
        config: this.config,
        state: JobLastRunState.finished,
        time: {
          start: Date.now(),
          end: Date.now()
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
    this.lastRuns[JSON.stringify(this.config)].state = JobLastRunState.canceled;
  }

  public toJSON(): JobDTO {
    return {
      Name: this.Name,
      ConfigTemplate: this.ConfigTemplate
    };
  }

  protected OnFinishCB = (status: JobLastRunState) => {
  };

  protected abstract async step(): Promise<JobProgressDTO>;

  protected abstract async init(): Promise<void>;

  private onFinish(): void {
    this.lastRuns[JSON.stringify(this.config)].all = this.progress.left + this.progress.progress;
    this.lastRuns[JSON.stringify(this.config)].done = this.progress.progress;
    this.lastRuns[JSON.stringify(this.config)].time.end = Date.now();

    this.progress = null;
    if (global.gc) {
      global.gc();
    }
    Logger.info(LOG_TAG, 'Job finished: ' + this.Name);
    if (this.IsInstant) {
      this.prResolve();
    }
    this.OnFinishCB(this.lastRuns[JSON.stringify(this.config)].state);
  }

  private run() {
    process.nextTick(async () => {
      try {
        if (this.state === JobState.idle) {
          return;
        }
        let prg = null;
        if (this.state === JobState.running) {
          prg = await this.step();
        }
        if (prg == null) { // finished
          this.state = JobState.idle;
          this.onFinish();
          return;
        }
        this.progress = prg;
        this.run();
      } catch (e) {
        Logger.error(LOG_TAG, e);
      }
    });
  }
}
