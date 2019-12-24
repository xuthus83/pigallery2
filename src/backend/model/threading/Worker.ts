import {DiskMangerWorker} from './DiskMangerWorker';
import {Logger} from '../../Logger';
import {RendererInput, PhotoWorker} from './PhotoWorker';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {Utils} from '../../../common/Utils';
import {ServerConfig} from '../../../common/config/private/IPrivateConfig';

declare var process: NodeJS.Process;
declare var global: NodeJS.Global;

export class Worker {
  public static process(): void {
    Logger.debug('Worker is waiting for tasks');
    process.on('message', async (task: WorkerTask) => {
      try {
        let result = null;
        switch (task.type) {
          case WorkerTaskTypes.diskManager:
            result = await DiskMangerWorker.scanDirectory((<DiskManagerTask>task).relativeDirectoryName, (<DiskManagerTask>task).settings);
            if (global.gc) {
              global.gc();
            }
            break;
          case WorkerTaskTypes.thumbnail:
            result = await PhotoWorker.render((<ThumbnailTask>task).input, (<ThumbnailTask>task).renderer);
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
  settings: DiskMangerWorker.DirectoryScanSettings;
}

export interface ThumbnailTask extends WorkerTask {
  input: RendererInput;
  renderer: ServerConfig.PhotoProcessingLib;
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
