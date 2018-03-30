import {IndexingProgressDTO} from '../../../common/entities/settings/IndexingProgressDTO';

export interface IIndexingManager {
  startIndexing(): void;

  getProgress(): IndexingProgressDTO;

  cancelIndexing(): void;

  reset(): Promise<void>;
}
