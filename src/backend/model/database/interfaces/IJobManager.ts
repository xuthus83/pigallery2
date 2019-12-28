import {JobProgressDTO} from '../../../../common/entities/job/JobProgressDTO';
import {JobDTO} from '../../../../common/entities/job/JobDTO';

export interface IJobManager {

  run(jobId: string, config: any): Promise<void>;

  stop(jobId: string): void;

  getProgresses(): { [key: string]: JobProgressDTO };


  getAvailableJobs(): JobDTO[];

  stopSchedules(): void;

  runSchedules(): void;

  getJobLastRuns(): { [key: string]: JobProgressDTO };
}
