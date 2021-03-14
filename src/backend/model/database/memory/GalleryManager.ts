import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {IGalleryManager} from '../interfaces/IGalleryManager';
import * as path from 'path';
import * as fs from 'fs';
import {DiskManager} from '../../DiskManger';
import {ProjectPath} from '../../../ProjectPath';
import {Config} from '../../../../common/config/private/Config';
import {DiskMangerWorker} from '../../threading/DiskMangerWorker';
import {ServerConfig} from '../../../../common/config/private/PrivateConfig';

export class GalleryManager implements IGalleryManager {

  public listDirectory(relativeDirectoryName: string, knownLastModified?: number, knownLastScanned?: number): Promise<DirectoryDTO> {
    // If it seems that the content did not changed, do not work on it
    if (knownLastModified && knownLastScanned) {
      const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
      const lastModified = DiskMangerWorker.calcLastModified(stat);
      if (Date.now() - knownLastScanned <= Config.Server.Indexing.cachedFolderTimeout &&
        lastModified === knownLastModified &&
        Config.Server.Indexing.reIndexingSensitivity < ServerConfig.ReIndexingSensitivity.high) {
        return Promise.resolve(null);
      }
    }
    return DiskManager.scanDirectory(relativeDirectoryName);
  }

}
