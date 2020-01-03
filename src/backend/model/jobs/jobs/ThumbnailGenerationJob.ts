import {Config} from '../../../../common/config/private/Config';
import {DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {FileJob} from './FileJob';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';
import {ThumbnailSourceType} from '../../threading/PhotoWorker';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {backendTexts} from '../../../../common/BackendTexts';


export class ThumbnailGenerationJob extends FileJob<{ sizes: number[], indexedOnly: boolean }> {

  public readonly Name = DefaultsJobs[DefaultsJobs['Thumbnail Generation']];

  constructor() {
    super({noMetaFile: true});
    this.ConfigTemplate.push({
      id: 'sizes',
      type: 'number-array',
      name: backendTexts.sizeToGenerate.name,
      description: backendTexts.sizeToGenerate.description,
      defaultValue: [Config.Client.Media.Thumbnail.thumbnailSizes[0]]
    });
  }

  public get Supported(): boolean {
    return true;
  }

  start(config: { sizes: number[], indexedOnly: boolean }, soloRun = false, allowParallelRun = false): Promise<void> {
    for (let i = 0; i < config.sizes.length; ++i) {
      if (Config.Client.Media.Thumbnail.thumbnailSizes.indexOf(config.sizes[i]) === -1) {
        throw new Error('unknown thumbnails size: ' + config.sizes[i] + '. Add it to the possible thumbnail sizes.');
      }
    }

    return super.start(config, soloRun, allowParallelRun);
  }

  protected async filterMediaFiles(files: FileDTO[]): Promise<FileDTO[]> {
    return files;
  }

  protected async filterMetaFiles(files: FileDTO[]): Promise<FileDTO[]> {
    return undefined;
  }

  protected async shouldProcess(mPath: string): Promise<boolean> {
    for (let i = 0; i < this.config.sizes.length; ++i) {
      if (!(await PhotoProcessing.convertedPhotoExist(mPath, this.config.sizes[i]))) {
        return true;
      }
    }
  }

  protected async processFile(mPath: string): Promise<void> {
    for (let i = 0; i < this.config.sizes.length; ++i) {
      await PhotoProcessing.generateThumbnail(mPath,
        this.config.sizes[i],
        MediaDTO.isVideoPath(mPath) ? ThumbnailSourceType.Video : ThumbnailSourceType.Photo,
        false);

    }
  }


}
