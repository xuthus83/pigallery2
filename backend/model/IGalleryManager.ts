import {Directory} from "../../common/entities/Directory";
export interface IGalleryManager {
    listDirectory(relativeDirectoryName: string, cb: (error: any, result: Directory) => void): void;
}