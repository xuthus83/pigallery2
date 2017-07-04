import * as cluster from "cluster";
import {Logger} from "../../Logger";
import {DiskManagerTask, ThumbnailTask, WorkerMessage, WorkerTask, WorkerTaskTypes} from "./Worker";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {RendererInput} from "./ThumbnailWoker";
import {Config} from "../../../common/config/private/Config";


interface PoolTask {
  task: WorkerTask;
  promise: { resolve: Function, reject: Function };
}

interface WorkerWrapper {
  worker: cluster.Worker;
  poolTask: PoolTask;
}

export class ThreadPool {

  public static WorkerCount = 0;
  private workers: WorkerWrapper[] = [];
  private tasks: PoolTask[] = [];

  constructor(private size: number) {
    Logger.silly("Creating thread pool with", size, "workers");
    for (let i = 0; i < size; i++) {
      this.startWorker();

    }
  }

  private startWorker() {
    const worker = <WorkerWrapper>{poolTask: null, worker: cluster.fork()};
    this.workers.push(worker);
    worker.worker.on('online', () => {
      ThreadPool.WorkerCount++;
      Logger.debug('Worker ' + worker.worker.process.pid + ' is online, worker count:', ThreadPool.WorkerCount);
    });
    worker.worker.on('exit', (code, signal) => {
      ThreadPool.WorkerCount--;
      Logger.warn('Worker ' + worker.worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal + ", worker count:", ThreadPool.WorkerCount);
      Logger.debug('Starting a new worker');
      this.startWorker();
    });

    worker.worker.on("message", (msg: WorkerMessage) => {
      if (worker.poolTask == null) {
        throw "No worker task after worker task is completed"
      }
      if (msg.error) {
        worker.poolTask.promise.reject(msg.error);
      } else {
        worker.poolTask.promise.resolve(msg.result);
      }
      worker.poolTask = null;
      this.run();
    });
  }

  protected executeTask<T>(task: WorkerTask): Promise<T> {
    return new Promise((resolve: Function, reject: Function) => {
      this.tasks.push({task: task, promise: {resolve: resolve, reject: reject}});
      this.run();
    });
  }

  private getFreeWorker() {
    for (let i = 0; i < this.workers.length; i++) {
      if (this.workers[i].poolTask == null) {
        return this.workers[i];
      }
    }
    return null;
  }

  private run = () => {
    if (this.tasks.length == 0) {
      return;
    }
    const worker = this.getFreeWorker();
    if (worker == null) {
      return;
    }

    const poolTask = this.tasks.pop();
    worker.poolTask = poolTask;
    worker.worker.send(poolTask.task);
  };

}

export class DiskManagerTH extends ThreadPool {
  execute(relativeDirectoryName: string): Promise<DirectoryDTO> {
    return super.executeTask(<DiskManagerTask>{
      type: WorkerTaskTypes.diskManager,
      relativeDirectoryName: relativeDirectoryName
    });
  }
}

export class ThumbnailTH extends ThreadPool {
  execute(input: RendererInput): Promise<void> {
    return super.executeTask(<ThumbnailTask>{
      type: WorkerTaskTypes.thumbnail,
      input: input,
      renderer: Config.Server.thumbnail.processingLibrary
    });
  }
}
