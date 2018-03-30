import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {IGalleryManager} from '../interfaces/IGalleryManager';
import * as path from 'path';
import * as fs from 'fs';
import {DiskManager} from '../DiskManger';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ReIndexingSensitivity} from '../../../common/config/private/IPrivateConfig';

export class GalleryManager implements IGalleryManager {

  public listDirectory(relativeDirectoryName: string, knownLastModified?: number, knownLastScanned?: number): Promise<DirectoryDTO> {
    //If it seems that the content did not changed, do not work on it
    if (knownLastModified && knownLastScanned) {
      const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
      const lastModified = Math.max(stat.ctime.getTime(), stat.mtime.getTime());
      if (Date.now() - knownLastScanned <= Config.Server.indexing.cachedFolderTimeout &&
        lastModified == knownLastModified &&
        Config.Server.indexing.reIndexingSensitivity < ReIndexingSensitivity.high) {
        return Promise.resolve(null);
      }
    }
    return DiskManager.scanDirectory(relativeDirectoryName);
  }

}
