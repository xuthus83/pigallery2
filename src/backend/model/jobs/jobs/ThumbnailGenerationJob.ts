import {Config} from '../../../../common/config/private/Config';
import {ConfigTemplateEntry, DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {ProjectPath} from '../../../ProjectPath';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import {FileJob} from './FileJob';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';
import {ThumbnailSourceType} from '../../threading/ThumbnailWorker';
import {MediaDTO} from '../../../../common/entities/MediaDTO';

const LOG_TAG = '[ThumbnailGenerationJob]';
const existsPr = util.promisify(fs.exists);


export class ThumbnailGenerationJob extends FileJob<MediaDTO, { sizes: number[] }> {
  public readonly Name = DefaultsJobs[DefaultsJobs['Thumbnail Generation']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = [{
    id: 'sizes',
    type: 'number-array',
    name: 'Sizes to generate',
    defaultValue: [Config.Client.Media.Thumbnail.thumbnailSizes[0]]
  }];

  constructor() {
    super({noMetaFile: true});
  }

  public get Supported(): boolean {
    return true;
  }

  start(config: { sizes: number[] }): Promise<void> {
    for (let i = 0; i < config.sizes.length; ++i) {
      if (Config.Client.Media.Thumbnail.thumbnailSizes.indexOf(config.sizes[i]) === -1) {
        throw new Error('unknown thumbnails size: ' + config.sizes[i] + '. Add it to the possible thumbnail sizes.');
      }
    }

    return super.start(config);
  }

  protected async processDirectory(directory: DirectoryDTO): Promise<MediaDTO[]> {
    return directory.media;
  }

  protected async processFile(media: MediaDTO): Promise<void> {

    const mPath = path.join(ProjectPath.ImageFolder, media.directory.path, media.directory.name, media.name);
    for (let i = 0; i < this.config.sizes.length; ++i) {
      await PhotoProcessing.generateThumbnail(mPath,
        this.config.sizes[i],
        MediaDTO.isVideo(media) ? ThumbnailSourceType.Video : ThumbnailSourceType.Photo,
        false);

    }
  }


}
