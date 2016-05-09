import {Directory} from "../../common/entities/Directory";
export interface IGalleryManager {
    listDirectory(relativeDirectoryName, cb:(error:any, result:Directory) => void);
}