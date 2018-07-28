import {RendererInput, ThumbnailWorker} from './ThumbnailWoker';
import {Config} from '../../../common/config/private/Config';


interface QueTask {
  data: RendererInput;
  promise: { resolve: Function, reject: Function };
}


export interface ITaskQue {
  execute(input: any): Promise<any>;
}

export class TaskQue implements ITaskQue {

  private tasks: QueTask[] = [];
  private taskInProgress = 0;
  private run = async () => {
    if (this.tasks.length === 0 || this.taskInProgress >= this.size) {
      return;
    }
    this.taskInProgress++;
    const task = this.tasks.shift();
    try {
      task.promise.resolve(await ThumbnailWorker.render(task.data, Config.Server.thumbnail.processingLibrary));
    } catch (err) {
      task.promise.reject(err);
    }
    this.taskInProgress--;
    process.nextTick(this.run);
  };

  constructor(private size: number) {
  }

  execute(input: RendererInput): Promise<void> {
    return new Promise((resolve: Function, reject: Function) => {
      this.tasks.push({
        data: input,
        promise: {resolve: resolve, reject: reject}
      });
      this.run();
    });
  }
}
