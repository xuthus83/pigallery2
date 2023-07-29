import {IJob} from './jobs/IJob';
import {IndexingJob} from './jobs/IndexingJob';
import {GalleryRestJob} from './jobs/GalleryResetJob';
import {VideoConvertingJob} from './jobs/VideoConvertingJob';
import {PhotoConvertingJob} from './jobs/PhotoConvertingJob';
import {ThumbnailGenerationJob} from './jobs/ThumbnailGenerationJob';
import {TempFolderCleaningJob} from './jobs/TempFolderCleaningJob';
import {PreviewFillingJob} from './jobs/PreviewFillingJob';
import {PreviewRestJob} from './jobs/PreviewResetJob';
import {GPXCompressionJob} from './jobs/GPXCompressionJob';
import {AlbumRestJob} from './jobs/AlbumResetJob';
import {GPXCompressionResetJob} from './jobs/GPXCompressionResetJob';
import {TopPickSendJob} from './jobs/TopPickSendJob';

export class JobRepository {
  private static instance: JobRepository = null;
  availableJobs: { [key: string]: IJob<any> } = {};

  public static get Instance(): JobRepository {
    if (JobRepository.instance == null) {
      JobRepository.instance = new JobRepository();
    }
    return JobRepository.instance;
  }

  getAvailableJobs(): IJob<any>[] {
    return Object.values(this.availableJobs).filter((t) => t.Supported);
  }

  register(job: IJob<any>): void {
    if (typeof this.availableJobs[job.Name] !== 'undefined') {
      throw new Error('Job already exist:' + job.Name);
    }
    this.availableJobs[job.Name] = job;
  }
}

JobRepository.Instance.register(new IndexingJob());
JobRepository.Instance.register(new GalleryRestJob());
JobRepository.Instance.register(new PreviewFillingJob());
JobRepository.Instance.register(new PreviewRestJob());
JobRepository.Instance.register(new VideoConvertingJob());
JobRepository.Instance.register(new PhotoConvertingJob());
JobRepository.Instance.register(new ThumbnailGenerationJob());
JobRepository.Instance.register(new GPXCompressionJob());
JobRepository.Instance.register(new TempFolderCleaningJob());
JobRepository.Instance.register(new AlbumRestJob());
JobRepository.Instance.register(new GPXCompressionResetJob());
JobRepository.Instance.register(new TopPickSendJob());
