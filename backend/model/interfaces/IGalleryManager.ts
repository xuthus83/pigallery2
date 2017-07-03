import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
export interface IGalleryManager {
  listDirectory(relativeDirectoryName: string): Promise<DirectoryDTO>;
}
