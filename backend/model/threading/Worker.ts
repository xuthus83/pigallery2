import {DiskMangerWorker} from './DiskMangerWorker';
import {Logger} from '../../Logger';
import {RendererInput, ThumbnailWorker} from './ThumbnailWorker';
import {ThumbnailProcessingLib} from '../../../common/config/private/IPrivateConfig';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {Utils} from '../../../common/Utils';

export class Worker {


  public static process() {
    Logger.debug('Worker is waiting for tasks');
    process.on('message', async (task: WorkerTask) => {
      try {
        let result = null;
        switch (task.type) {
          case WorkerTaskTypes.diskManager:
            result = await DiskMangerWorker.scanDirectory((<DiskManagerTask>task).relativeDirectoryName);
            if (global.gc) {
              global.gc();
            }
            break;
          case WorkerTaskTypes.thumbnail:
            result = await ThumbnailWorker.render((<ThumbnailTask>task).input, (<ThumbnailTask>task).renderer);
            break;
          default:
            throw new Error('Unknown worker task type');
        }
        process.send(<WorkerMessage>{
          error: null,
          result: result
        });
      } catch (err) {
        process.send({error: err, result: null});
      }
    });
  }
}


export enum WorkerTaskTypes {
  thumbnail = 1, diskManager = 2
}

export interface WorkerTask {
  type: WorkerTaskTypes;
}

export interface DiskManagerTask extends WorkerTask {
  relativeDirectoryName: string;
}

export interface ThumbnailTask extends WorkerTask {
  input: RendererInput;
  renderer: ThumbnailProcessingLib;
}

export module WorkerTask {
  export const equals = (t1: WorkerTask, t2: WorkerTask): boolean => {
    return Utils.equalsFilter(t1, t2);
  };
}

export interface WorkerMessage {
  error: Error;
  result: DirectoryDTO | void;
}
