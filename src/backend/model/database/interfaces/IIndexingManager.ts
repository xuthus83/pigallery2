import {ParentDirectoryDTO} from '../../../../common/entities/DirectoryDTO';

export interface IIndexingManager {
  SavingReady: Promise<void>;
  IsSavingInProgress: boolean;

  indexDirectory(relativeDirectoryName: string): Promise<ParentDirectoryDTO>;

  resetDB(): Promise<void>;
}
