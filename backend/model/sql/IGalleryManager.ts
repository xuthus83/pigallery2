import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";

export interface ISQLGalleryManager {
  listDirectory(relativeDirectoryName: string,
                knownLastModified?: number,
                knownLastScanned?: number): Promise<DirectoryDTO>;

  indexDirectory(relativeDirectoryName): Promise<DirectoryDTO>;

}
