import {IJob} from './jobs/IJob';
import {IndexingJob} from './jobs/IndexingJob';
import {DBRestJob} from './jobs/DBResetJob';
import {VideoConvertingJob} from './jobs/VideoConvertingJob';
import {PhotoConvertingJob} from './jobs/PhotoConvertingJob';
import {ThumbnailGenerationJob} from './jobs/ThumbnailGenerationJob';

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
    return Object.values(this.availableJobs).filter(t => t.Supported);
  }

  register(job: IJob<any>) {
    this.availableJobs[job.Name] = job;
  }
}


JobRepository.Instance.register(new IndexingJob());
JobRepository.Instance.register(new DBRestJob());
JobRepository.Instance.register(new VideoConvertingJob());
JobRepository.Instance.register(new PhotoConvertingJob());
JobRepository.Instance.register(new ThumbnailGenerationJob());
