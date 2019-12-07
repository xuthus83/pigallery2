import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {Logger} from '../../Logger';
import {ITask} from './ITask';
import {ConfigTemplateEntry} from '../../../common/entities/task/TaskDTO';

declare const process: any;

export abstract class Task<T = void> implements ITask<T> {

  protected progress: TaskProgressDTO = null;
  protected running = false;
  protected config: T;


  public abstract get Supported(): boolean;

  public abstract get Name(): string;

  public abstract get ConfigTemplate(): ConfigTemplateEntry[];


  public get Progress(): TaskProgressDTO {
    return this.progress;
  }

  public start(config: T): void {
    if (this.running === false && this.Supported) {
      Logger.info('[Task]', 'Running task: ' + this.Name);
      this.config = config;
      this.progress = {
        progress: 0,
        left: 0,
        comment: '',
        time: {
          start: Date.now(),
          current: Date.now()
        }
      };
      this.running = true;
      this.init().catch(console.error);
      this.run();
    } else {
      Logger.info('[Task]', 'Task already running: ' + this.Name);
    }
  }

  public stop(): void {
    Logger.info('[Task]', 'Stopping task: ' + this.Name);
    this.running = false;
    this.onFinish();
  }

  protected abstract async step(): Promise<TaskProgressDTO>;

  protected abstract async init(): Promise<void>;

  private onFinish(): void {
    this.progress = null;
    Logger.info('[Task]', 'Task finished: ' + this.Name);
  }

  private run() {
    process.nextTick(async () => {
      try {
        if (!this.running) {
          this.progress = null;
          return;
        }
        this.progress = await this.step();
        if (this.progress == null) { // finished
          this.running = false;
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
