import {JobProgress} from './JobProgress';
import {IJob} from './IJob';
import {JobProgressStates} from '../../../../common/entities/job/JobProgressDTO';

export interface IJobListener {
  onJobFinished(job: IJob<any>, state: JobProgressStates): void;

  onProgressUpdate(progress: JobProgress): void;
}
