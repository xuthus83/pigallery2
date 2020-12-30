import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';

export interface IIndexingManager {
  SavingReady: Promise<void>;
  IsSavingInProgress: boolean;

  indexDirectory(relativeDirectoryName: string): Promise<DirectoryDTO>;

  resetDB(): Promise<void>;
}
