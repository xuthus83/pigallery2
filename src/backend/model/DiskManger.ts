import {DirectoryDTO} from '../../common/entities/DirectoryDTO';
import {Logger} from '../Logger';
import {Config} from '../../common/config/private/Config';
import {DiskManagerTH} from './threading/ThreadPool';
import {DiskMangerWorker} from './threading/DiskMangerWorker';


const LOG_TAG = '[DiskManager]';

export class DiskManager {
  static threadPool: DiskManagerTH = null;

  public static init() {
    if (Config.Server.Threading.enabled === true) {
      DiskManager.threadPool = new DiskManagerTH(1);
    }
  }

  public static async scanDirectory(relativeDirectoryName: string,
                                    settings: DiskMangerWorker.DirectoryScanSettings = {}): Promise<DirectoryDTO> {

    Logger.silly(LOG_TAG, 'scanning directory:', relativeDirectoryName);

    let directory: DirectoryDTO;

    if (Config.Server.Threading.enabled === true) {
      directory = await DiskManager.threadPool.execute(relativeDirectoryName, settings);
    } else {
      directory = await DiskMangerWorker.scanDirectory(relativeDirectoryName, settings);
    }
    const addDirs = (dir: DirectoryDTO) => {
      dir.media.forEach((ph) => {
        ph.directory = dir;
      });
      dir.directories.forEach((d) => {
        addDirs(d);
      });
    };
    addDirs(directory);
    return directory;
  }

}
