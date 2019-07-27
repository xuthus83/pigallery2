import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';

export interface IIndexingTaskManager {
  startIndexing(createThumbnails?: boolean): void;

  getProgress(): TaskProgressDTO;

  cancelIndexing(): void;

  reset(): Promise<void>;
}
