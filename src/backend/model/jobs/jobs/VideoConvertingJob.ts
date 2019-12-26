import {Config} from '../../../../common/config/private/Config';
import {DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {ProjectPath} from '../../../ProjectPath';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import {FileJob} from './FileJob';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {VideoProcessing} from '../../fileprocessing/VideoProcessing';

const LOG_TAG = '[VideoConvertingJob]';
const existsPr = util.promisify(fs.exists);


export class VideoConvertingJob extends FileJob<string> {
  public readonly Name = DefaultsJobs[DefaultsJobs['Video Converting']];

  constructor() {
    super({noPhoto: true, noMetaFile: true});
  }

  public get Supported(): boolean {
    return Config.Client.Media.Video.enabled === true;
  }

  protected async processDirectory(directory: DirectoryDTO): Promise<string[]> {
    const ret = [];
    for (let i = 0; i < directory.media.length; ++i) {
      const videoPath = path.join(ProjectPath.ImageFolder,
        directory.media[i].directory.path,
        directory.media[i].directory.name,
        directory.media[i].name);

      if (await existsPr(VideoProcessing.generateConvertedFilePath(videoPath)) === false) {
        ret.push(videoPath);
      }
    }
    return ret;
  }

  protected async processFile(file: string): Promise<void> {
    await VideoProcessing.convertVideo(file);
  }


}
