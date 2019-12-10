import * as fs from 'fs';
import {Stats} from 'fs';
import * as path from 'path';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {VideoDTO} from '../../../common/entities/VideoDTO';
import {FileDTO} from '../../../common/entities/FileDTO';
import {MetadataLoader} from './MetadataLoader';
import {Logger} from '../../Logger';
import {SupportedFormats} from '../../../common/SupportedFormats';

const LOG_TAG = '[DiskManagerTask]';


export class DiskMangerWorker {


  public static calcLastModified(stat: Stats) {
    return Math.max(stat.ctime.getTime(), stat.mtime.getTime());
  }

  public static normalizeDirPath(dirPath: string): string {
    return path.normalize(path.join('.' + path.sep, dirPath));
  }

  public static pathFromRelativeDirName(relativeDirectoryName: string): string {
    return path.join(path.dirname(this.normalizeDirPath(relativeDirectoryName)), path.sep);
  }


  public static pathFromParent(parent: { path: string, name: string }): string {
    return path.join(this.normalizeDirPath(path.join(parent.path, parent.name)), path.sep);
  }

  public static dirName(name: string) {
    if (name.trim().length === 0) {
      return '.';
    }
    return path.basename(name);
  }

  public static excludeDir(name: string, relativeDirectoryName: string, absoluteDirectoryName: string) {
    if (Config.Server.Indexing.excludeFolderList.length === 0 ||
      Config.Server.Indexing.excludeFileList.length === 0) {
      return false;
    }
    const absoluteName = path.normalize(path.join(absoluteDirectoryName, name));
    const relativeName = path.normalize(path.join(relativeDirectoryName, name));

    for (let j = 0; j < Config.Server.Indexing.excludeFolderList.length; j++) {
      const exclude = Config.Server.Indexing.excludeFolderList[j];

      if (exclude.startsWith('/')) {
        if (exclude === absoluteName) {
          return true;
        }
      } else if (exclude.includes('/')) {
        if (path.normalize(exclude) === relativeName) {
          return true;
        }
      } else {
        if (exclude === name) {
          return true;
        }
      }
    }
    // exclude dirs that have the given files (like .ignore)
    for (let j = 0; j < Config.Server.Indexing.excludeFileList.length; j++) {
      const exclude = Config.Server.Indexing.excludeFileList[j];

      if (fs.existsSync(path.join(absoluteName, exclude))) {
        return true;
      }
    }

    return false;
  }

  public static scanDirectory(relativeDirectoryName: string, settings: DiskMangerWorker.DirectoryScanSettings = {}): Promise<DirectoryDTO> {
    return new Promise<DirectoryDTO>((resolve, reject) => {
      relativeDirectoryName = this.normalizeDirPath(relativeDirectoryName);
      const directoryName = DiskMangerWorker.dirName(relativeDirectoryName);
      const directoryParent = this.pathFromRelativeDirName(relativeDirectoryName);
      const absoluteDirectoryName = path.join(ProjectPath.ImageFolder, relativeDirectoryName);

      const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
      const directory: DirectoryDTO = {
        id: null,
        parent: null,
        name: directoryName,
        path: directoryParent,
        lastModified: this.calcLastModified(stat),
        lastScanned: Date.now(),
        directories: [],
        isPartial: false,
        mediaCount: 0,
        media: [],
        metaFile: []
      };
      fs.readdir(absoluteDirectoryName, async (err, list: string[]) => {
        if (err) {
          return reject(err);
        }
        try {
          for (let i = 0; i < list.length; i++) {
            const file = list[i];
            const fullFilePath = path.normalize(path.join(absoluteDirectoryName, file));
            if (fs.statSync(fullFilePath).isDirectory()) {
              if (settings.noDirectory === true ||
                DiskMangerWorker.excludeDir(file, relativeDirectoryName, absoluteDirectoryName)) {
                continue;
              }

              // create preview directory
              const d = await DiskMangerWorker.scanDirectory(path.join(relativeDirectoryName, file),
                {
                  maxPhotos: Config.Server.Indexing.folderPreviewSize,
                  noMetaFile: true,
                  noVideo: true,
                  noDirectory: true
                }
              );
              d.lastScanned = 0; // it was not a fully scan
              d.isPartial = true;
              directory.directories.push(d);
            } else if (DiskMangerWorker.isImage(fullFilePath)) {
              if (settings.noPhoto) {
                continue;
              }
              directory.media.push(<PhotoDTO>{
                name: file,
                directory: null,
                metadata: await MetadataLoader.loadPhotoMetadata(fullFilePath)
              });

              if (settings.maxPhotos && directory.media.length > settings.maxPhotos) {
                break;
              }
            } else if (DiskMangerWorker.isVideo(fullFilePath)) {
              if (Config.Client.Video.enabled === false || settings.noVideo) {
                continue;
              }
              try {
                directory.media.push(<VideoDTO>{
                  name: file,
                  directory: null,
                  metadata: await MetadataLoader.loadVideoMetadata(fullFilePath)
                });
              } catch (e) {
                Logger.warn('Media loading error, skipping: ' + file + ', reason: ' + e.toString());
              }

            } else if (DiskMangerWorker.isMetaFile(fullFilePath)) {
              if (Config.Client.MetaFile.enabled === false || settings.noMetaFile) {
                continue;
              }

              directory.metaFile.push(<FileDTO>{
                name: file,
                directory: null,
              });

            }
          }

          directory.mediaCount = directory.media.length;

          return resolve(directory);
        } catch (err) {
          return reject({error: err});
        }

      });
    });

  }

  private static isImage(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return SupportedFormats.WithDots.Photos.indexOf(extension) !== -1;
  }

  private static isVideo(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return SupportedFormats.WithDots.Videos.indexOf(extension) !== -1;
  }

  private static isMetaFile(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return SupportedFormats.WithDots.MetaFiles.indexOf(extension) !== -1;
  }

}

export namespace DiskMangerWorker {
  export interface DirectoryScanSettings {
    maxPhotos?: number;
    noMetaFile?: boolean;
    noVideo?: boolean;
    noPhoto?: boolean;
    noDirectory?: boolean;
  }
}
