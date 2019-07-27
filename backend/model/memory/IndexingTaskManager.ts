import {IIndexingTaskManager} from '../interfaces/IIndexingTaskManager';
import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';

export class IndexingTaskManager implements IIndexingTaskManager {

  startIndexing(): void {
    throw new Error('not supported by memory DB');
  }

  getProgress(): TaskProgressDTO {
    throw new Error('not supported by memory DB');
  }

  cancelIndexing(): void {
    throw new Error('not supported by memory DB');
  }

  reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
