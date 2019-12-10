import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {TaskDTO} from '../../../common/entities/task/TaskDTO';

export interface ITaskManager {

  run(taskId: string, config: any): Promise<void>;

  stop(taskId: string): void;

  getProgresses(): { [key: string]: TaskProgressDTO };


  getAvailableTasks(): TaskDTO[];

  stopSchedules(): void;

  runSchedules(): void;
}
