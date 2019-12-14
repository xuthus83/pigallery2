import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';

export interface IIndexingManager {
  indexDirectory(relativeDirectoryName: string): Promise<DirectoryDTO>;

  resetDB(): Promise<void>;
}
