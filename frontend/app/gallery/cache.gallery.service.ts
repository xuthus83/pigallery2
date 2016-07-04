///<reference path="../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {Photo} from "../../../common/entities/Photo";
import {Directory} from "../../../common/entities/Directory";
import {Utils} from "../../../common/Utils";
import {Config} from "../config/Config";

@Injectable()
export class GalleryCacheService {


    public getDirectory(directoryName:string):Directory {
        if (Config.Client.enableCache == false) {
            return null;
        }
        let value = localStorage.getItem(directoryName);
        if (value != null) {
            let directory:Directory = JSON.parse(value);


            directory.photos.forEach((photo:Photo) => {
                photo.metadata.creationDate = new Date(<any>photo.metadata.creationDate);
            });
            
            directory.photos.forEach((photo:Photo) => {
                photo.directory = directory;
            });

            return directory;
        }
        return null;
    }

    public setDirectory(directory:Directory):void {
        if (Config.Client.enableCache == false) {
            return;
        }
        
        localStorage.setItem(Utils.concatUrls(directory.path, directory.name), JSON.stringify(directory));

        directory.directories.forEach((dir:Directory) => {
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
    public photoUpdated(photo:Photo):void {

        if (Config.Client.enableCache == false) {
            return;
        }

        let directoryName = Utils.concatUrls(photo.directory.path, photo.directory.name);
        let value = localStorage.getItem(directoryName);
        if (value != null) {
            let directory:Directory = JSON.parse(value);
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
