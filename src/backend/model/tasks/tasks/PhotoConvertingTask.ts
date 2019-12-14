import {Config} from '../../../../common/config/private/Config';
import {DefaultsTasks} from '../../../../common/entities/task/TaskDTO';
import {ProjectPath} from '../../../ProjectPath';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import {FileTask} from './FileTask';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';
import {ThumbnailSourceType} from '../../threading/ThumbnailWorker';

const LOG_TAG = '[PhotoConvertingTask]';
const existsPr = util.promisify(fs.exists);


export class PhotoConvertingTask extends FileTask<string> {
  public readonly Name = DefaultsTasks[DefaultsTasks['Video Converting']];

  constructor() {
    super({noVideo: true, noMetaFile: true});
  }

  public get Supported(): boolean {
    return Config.Server.Media.Photo.converting.enabled === true;
  }

  protected async processDirectory(directory: DirectoryDTO): Promise<string[]> {
    const ret = [];
    for (let i = 0; i < directory.media.length; ++i) {
      const photoPath = path.join(ProjectPath.ImageFolder,
        directory.media[i].directory.path,
        directory.media[i].directory.name,
        directory.media[i].name);

      if (await existsPr(PhotoProcessing.generateConvertedFileName(photoPath)) === false) {
        ret.push(photoPath);
      }
    }
    return ret;
  }

  protected async processFile(file: string): Promise<void> {
    await PhotoProcessing.generateThumbnail(file, Config.Server.Media.Photo.converting.resolution, ThumbnailSourceType.Photo, false);
  }


}
