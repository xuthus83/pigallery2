import {IIndexingManager} from '../interfaces/IIndexingManager';
import {ParentDirectoryDTO} from '../../../../common/entities/DirectoryDTO';

export class IndexingManager implements IIndexingManager {
  IsSavingInProgress: boolean;
  SavingReady: Promise<void>;

  indexDirectory(relativeDirectoryName: string): Promise<ParentDirectoryDTO> {
    throw new Error('not supported by memory DB');
  }

  resetDB(): Promise<void> {
    throw new Error('not supported by memory DB');
  }


}
