import {Config} from '../../../../common/config/private/Config';
import {DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {ProjectPath} from '../../../ProjectPath';
import * as path from 'path';
import {FileJob} from './FileJob';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';
import {ThumbnailSourceType} from '../../threading/PhotoWorker';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {JobLastRunState} from '../../../../common/entities/job/JobLastRunDTO';

const LOG_TAG = '[ThumbnailGenerationJob]';


export class ThumbnailGenerationJob extends FileJob<{ sizes: number[], indexedOnly: boolean }> {
  public readonly Name = DefaultsJobs[DefaultsJobs['Thumbnail Generation']];

  constructor() {
    super({noMetaFile: true});
    this.ConfigTemplate.push({
      id: 'sizes',
      type: 'number-array',
      name: 'Sizes to generate',
      defaultValue: [Config.Client.Media.Thumbnail.thumbnailSizes[0]]
    });
  }

  public get Supported(): boolean {
    return true;
  }

  start(config: { sizes: number[], indexedOnly: boolean }, OnFinishCB: (status: JobLastRunState) => void): Promise<void> {
    for (let i = 0; i < config.sizes.length; ++i) {
      if (Config.Client.Media.Thumbnail.thumbnailSizes.indexOf(config.sizes[i]) === -1) {
        throw new Error('unknown thumbnails size: ' + config.sizes[i] + '. Add it to the possible thumbnail sizes.');
      }
    }

    return super.start(config, OnFinishCB);
  }

  protected async filterMediaFiles(files: FileDTO[]): Promise<FileDTO[]> {
    return files;
  }

  protected async filterMetaFiles(files: FileDTO[]): Promise<FileDTO[]> {
    return undefined;
  }

  protected async processFile(media: FileDTO): Promise<void> {

    const mPath = path.join(ProjectPath.ImageFolder, media.directory.path, media.directory.name, media.name);
    for (let i = 0; i < this.config.sizes.length; ++i) {
      await PhotoProcessing.generateThumbnail(mPath,
        this.config.sizes[i],
        MediaDTO.isVideo(media) ? ThumbnailSourceType.Video : ThumbnailSourceType.Photo,
        false);

    }
  }


}
