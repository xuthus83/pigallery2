import {Injectable} from "@angular/core";
import {PhotoDTO} from "../../../common/entities/PhotoDTO";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {Utils} from "../../../common/Utils";
import {Config} from "../../../common/config/public/Config";

@Injectable()
export class GalleryCacheService {


    public getDirectory(directoryName: string): DirectoryDTO {
        if (Config.Client.enableCache == false) {
            return null;
        }
        let value = localStorage.getItem(directoryName);
        if (value != null) {
            let directory: DirectoryDTO = JSON.parse(value);


            //Add references
            let addDir = (dir: DirectoryDTO) => {
                dir.photos.forEach((photo: PhotoDTO) => {
                    photo.directory = dir;
                });

                dir.directories.forEach((directory: DirectoryDTO) => {
                    addDir(directory);
                    directory.parent = dir;
                });


            };
            addDir(directory);


            return directory;
        }
        return null;
    }

    public setDirectory(directory: DirectoryDTO): void {
        if (Config.Client.enableCache == false) {
            return;
        }

        localStorage.setItem(Utils.concatUrls(directory.path, directory.name), JSON.stringify(directory));

        directory.directories.forEach((dir: DirectoryDTO) => {
            let name = Utils.concatUrls(dir.path, dir.name);
            if (localStorage.getItem(name) == null) { //don't override existing
                localStorage.setItem(Utils.concatUrls(dir.path, dir.name), JSON.stringify(dir));
            }
        });

    }

    /**
     * Update photo state at cache too (Eg.: thumbnail rendered)
     * @param photo
     */
    public photoUpdated(photo: PhotoDTO): void {

        if (Config.Client.enableCache == false) {
            return;
        }

        let directoryName = Utils.concatUrls(photo.directory.path, photo.directory.name);
        let value = localStorage.getItem(directoryName);
        if (value != null) {
            let directory: DirectoryDTO = JSON.parse(value);
            directory.photos.forEach((p) => {
                if (p.name === photo.name) {
                    //update data
                    p.metadata = photo.metadata;
                    p.readyThumbnails = photo.readyThumbnails;

                    //save changes
                    localStorage.setItem(directoryName, JSON.stringify(directory));
                    return;
                }
            });
        }

    }

}
