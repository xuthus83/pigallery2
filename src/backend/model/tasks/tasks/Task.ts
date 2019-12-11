import {TaskProgressDTO, TaskState} from '../../../../common/entities/settings/TaskProgressDTO';
import {Logger} from '../../../Logger';
import {ITask} from './ITask';
import {ConfigTemplateEntry, TaskDTO} from '../../../../common/entities/task/TaskDTO';

declare const process: any;

export abstract class Task<T = void> implements ITask<T> {

  protected progress: TaskProgressDTO = null;
  protected state = TaskState.idle;
  protected config: T;
  protected prResolve: () => void;


  public abstract get Supported(): boolean;

  public abstract get Name(): string;

  public abstract get ConfigTemplate(): ConfigTemplateEntry[];


  public get Progress(): TaskProgressDTO {
    return this.progress;
  }

  public start(config: T): Promise<void> {
    if (this.state === TaskState.idle && this.Supported) {
      Logger.info('[Task]', 'Running task: ' + this.Name);
      this.config = config;
      this.progress = {
        progress: 0,
        left: 0,
        comment: '',
        state: TaskState.running,
        time: {
          start: Date.now(),
          current: Date.now()
        }
      };
      const pr = new Promise<void>((resolve) => {
        this.prResolve = resolve;
      });
      this.init().catch(console.error);
      this.state = TaskState.running;
      this.run();
      return pr;
    } else {
      Logger.info('[Task]', 'Task already running: ' + this.Name);
      return Promise.reject();
    }
  }

  public stop(): void {
    Logger.info('[Task]', 'Stopping task: ' + this.Name);
    this.state = TaskState.stopping;
    this.progress.state = TaskState.stopping;
  }

  public toJSON(): TaskDTO {
    return {
      Name: this.Name,
      ConfigTemplate: this.ConfigTemplate
    };
  }

  protected abstract async step(): Promise<TaskProgressDTO>;

  protected abstract async init(): Promise<void>;

  private onFinish(): void {
    this.progress = null;
    Logger.info('[Task]', 'Task finished: ' + this.Name);
    this.prResolve();
  }

  private run() {
    process.nextTick(async () => {
      try {
        if (this.state === TaskState.idle) {
          this.progress = null;
          return;
        }
        this.progress = await this.step();
        if (this.progress == null) { // finished
          this.state = TaskState.idle;
          this.onFinish();
          return;
        }
        this.run();
      } catch (e) {
        Logger.error('[Task]', e);
      }
    });
  }
}
