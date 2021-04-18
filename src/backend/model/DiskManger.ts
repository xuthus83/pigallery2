import {DirectoryDTO, DirectoryDTOUtils} from '../../common/entities/DirectoryDTO';
import {Logger} from '../Logger';
import {Config} from '../../common/config/private/Config';
import {DiskManagerTH} from './threading/ThreadPool';
import {DirectoryScanSettings, DiskMangerWorker} from './threading/DiskMangerWorker';
import {FileDTO} from '../../common/entities/FileDTO';


const LOG_TAG = '[DiskManager]';

export class DiskManager {
  static threadPool: DiskManagerTH = null;

  public static init(): void {
    if (Config.Server.Threading.enabled === true) {
      DiskManager.threadPool = new DiskManagerTH(1);
    }
  }


  public static async scanDirectoryNoMetadata(relativeDirectoryName: string,
                                              settings: DirectoryScanSettings = {}): Promise<DirectoryDTO<FileDTO>> {
    settings.noMetadata = true;
    return this.scanDirectory(relativeDirectoryName, settings);
  }

  public static async scanDirectory(relativeDirectoryName: string,
                                    settings: DirectoryScanSettings = {}): Promise<DirectoryDTO> {

    Logger.silly(LOG_TAG, 'scanning directory:', relativeDirectoryName);

    let directory: DirectoryDTO;

    if (Config.Server.Threading.enabled === true) {
      directory = await DiskManager.threadPool.execute(relativeDirectoryName, settings);
    } else {
      directory = await DiskMangerWorker.scanDirectory(relativeDirectoryName, settings);
    }
    DirectoryDTOUtils.unpackDirectory(directory);
    return directory;
  }

}
