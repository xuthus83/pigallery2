import {Config} from '../../../../common/config/private/Config';
import {DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {ProjectPath} from '../../../ProjectPath';
import * as path from 'path';
import {FileJob} from './FileJob';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';
import {FileDTO} from '../../../../common/entities/FileDTO';

const LOG_TAG = '[PhotoConvertingJob]';


export class PhotoConvertingJob extends FileJob {
  public readonly Name = DefaultsJobs[DefaultsJobs['Photo Converting']];

  constructor() {
    super({noVideo: true, noMetaFile: true});
  }

  public get Supported(): boolean {
    return Config.Client.Media.Photo.Converting.enabled === true;
  }


  protected async shouldProcess(file: FileDTO): Promise<boolean> {
    const mPath = path.join(ProjectPath.ImageFolder, file.directory.path, file.directory.name, file.name);
    return !(await PhotoProcessing.convertedPhotoExist(mPath, Config.Server.Media.Photo.Converting.resolution));
  }


  protected async processFile(file: FileDTO): Promise<void> {
    const mPath = path.join(ProjectPath.ImageFolder, file.directory.path, file.directory.name, file.name);
    await PhotoProcessing.convertPhoto(mPath);
  }


}
