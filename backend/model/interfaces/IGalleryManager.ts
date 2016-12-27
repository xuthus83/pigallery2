import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
export interface IGalleryManager {
    listDirectory(relativeDirectoryName: string, cb: (error: any, result: DirectoryDTO) => void): void;
}