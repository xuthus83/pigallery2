import {TaskProgressDTO} from '../../../../common/entities/settings/TaskProgressDTO';
import {TaskDTO} from '../../../../common/entities/task/TaskDTO';

export interface ITask<T> extends TaskDTO {
  Name: string;
  Supported: boolean;
  Progress: TaskProgressDTO;

  start(config: T): Promise<void>;

  stop(): void;

  toJSON(): TaskDTO;
}
