import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {IGalleryManager} from "../interfaces/IGalleryManager";
import {DiskManager} from "../DiskManger";

export class GalleryManager implements IGalleryManager {


    public listDirectory(relativeDirectoryName: string, cb: (error: any, result: DirectoryDTO) => void) {
        return DiskManager.scanDirectory(relativeDirectoryName, cb);
    }


}