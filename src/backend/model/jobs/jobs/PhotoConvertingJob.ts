import {Config} from '../../../../common/config/private/Config';
import {DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {ProjectPath} from '../../../ProjectPath';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import {FileJob} from './FileJob';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';

const LOG_TAG = '[PhotoConvertingJob]';
const existsPr = util.promisify(fs.exists);


export class PhotoConvertingJob extends FileJob<string> {
  public readonly Name = DefaultsJobs[DefaultsJobs['Photo Converting']];

  constructor() {
    super({noVideo: true, noMetaFile: true});
  }

  public get Supported(): boolean {
    return Config.Client.Media.Photo.Converting.enabled === true;
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
    await PhotoProcessing.convertPhoto(file, Config.Server.Media.Photo.Converting.resolution);
  }


}
