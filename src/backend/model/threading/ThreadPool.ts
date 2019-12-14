import * as cluster from 'cluster';
import {Logger} from '../../Logger';
import {DiskManagerTask, ThumbnailTask, WorkerMessage, WorkerTask, WorkerTaskTypes} from './Worker';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {RendererInput} from './ThumbnailWorker';
import {Config} from '../../../common/config/private/Config';
import {TaskQue, TaskQueEntry} from './TaskQue';
import {ITaskExecuter} from './TaskExecuter';
import {DiskMangerWorker} from './DiskMangerWorker';


interface WorkerWrapper<O> {
  worker: cluster.Worker;
  poolTask: TaskQueEntry<WorkerTask, O>;
}

export class ThreadPool<O> {

  public static WorkerCount = 0;
  private workers: WorkerWrapper<O>[] = [];
  private taskQue = new TaskQue<WorkerTask, O>();

  constructor(private size: number) {
    Logger.silly('Creating thread pool with', size, 'workers');
    for (let i = 0; i < size; i++) {
      this.startWorker();
    }
  }

  protected executeTask(task: WorkerTask): Promise<O> {
    const promise = this.taskQue.add(task).promise.obj;
    this.run();
    return promise;
  }

  private run = () => {
    if (this.taskQue.isEmpty()) {
      return;
    }
    const worker = this.getFreeWorker();
    if (worker == null) {
      return;
    }

    const poolTask = this.taskQue.get();
    worker.poolTask = poolTask;
    worker.worker.send(poolTask.data);
  };

  private getFreeWorker() {
    for (let i = 0; i < this.workers.length; i++) {
      if (this.workers[i].poolTask == null) {
        return this.workers[i];
      }
    }
    return null;
  }

  private startWorker() {
    const worker = <WorkerWrapper<O>>{poolTask: null, worker: cluster.fork()};
    this.workers.push(worker);
    worker.worker.on('online', () => {
      ThreadPool.WorkerCount++;
      Logger.debug('Worker ' + worker.worker.process.pid + ' is online, worker count:', ThreadPool.WorkerCount);
    });
    worker.worker.on('exit', (code, signal) => {
      ThreadPool.WorkerCount--;
      Logger.warn('Worker ' + worker.worker.process.pid + ' died with code: ' + code +
        ', and signal: ' + signal + ', worker count:', ThreadPool.WorkerCount);
      Logger.debug('Starting a new worker');
      this.startWorker();
    });

    worker.worker.on('message', (msg: WorkerMessage) => {
      if (worker.poolTask == null) {
        throw new Error('No worker task after worker task is completed');
      }
      if (msg.error) {
        worker.poolTask.promise.reject(msg.error);
      } else {
        worker.poolTask.promise.resolve(msg.result);
      }
      this.taskQue.ready(worker.poolTask);
      worker.poolTask = null;
      this.run();
    });
  }

}

export class DiskManagerTH extends ThreadPool<DirectoryDTO> implements ITaskExecuter<string, DirectoryDTO> {
  execute(relativeDirectoryName: string, settings: DiskMangerWorker.DirectoryScanSettings = {}): Promise<DirectoryDTO> {
    return super.executeTask(<DiskManagerTask>{
      type: WorkerTaskTypes.diskManager,
      relativeDirectoryName: relativeDirectoryName,
      settings: settings
    });
  }
}

export class ThumbnailTH extends ThreadPool<void> implements ITaskExecuter<RendererInput, void> {
  execute(input: RendererInput): Promise<void> {
    return super.executeTask(<ThumbnailTask>{
      type: WorkerTaskTypes.thumbnail,
      input: input,
      renderer: Config.Server.Media.Thumbnail.processingLibrary
    });
  }
}
