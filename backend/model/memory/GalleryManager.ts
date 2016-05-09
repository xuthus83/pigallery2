import {Directory} from "../../../common/entities/Directory";
import {IGalleryManager} from "../IGalleryManager";
import {DiskManager} from "../DiskManger";

export class GalleryManager implements IGalleryManager {


    public listDirectory(relativeDirectoryName, cb:(error:any, result:Directory) => void) {
        return DiskManager.scanDirectory(relativeDirectoryName, cb);
    }


}