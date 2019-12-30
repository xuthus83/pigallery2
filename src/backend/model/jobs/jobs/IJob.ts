import {JobDTO} from '../../../../common/entities/job/JobDTO';
import {JobProgress} from './JobProgress';
import {IJobListener} from './IJobListener';

export interface IJob<T> extends JobDTO {
  Name: string;
  Supported: boolean;
  Progress: JobProgress;
  JobListener: IJobListener;

  start(config: T, soloRun?: boolean): Promise<void>;

  cancel(): void;

  toJSON(): JobDTO;
}
