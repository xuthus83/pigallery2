import {JobProgressDTO} from '../../../../common/entities/settings/JobProgressDTO';
import {JobDTO} from '../../../../common/entities/job/JobDTO';

export interface IJob<T> extends JobDTO {
  Name: string;
  Supported: boolean;
  Progress: JobProgressDTO;

  start(config: T, onFinishCB?: () => void): Promise<void>;

  stop(): void;

  toJSON(): JobDTO;
}
