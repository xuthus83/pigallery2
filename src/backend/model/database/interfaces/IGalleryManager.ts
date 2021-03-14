import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';

export interface IGalleryManager {
  listDirectory(relativeDirectoryName: string,
                knownLastModified?: number,
                knownLastScanned?: number): Promise<DirectoryDTO>;


}
