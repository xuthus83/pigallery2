///<reference path="../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {Photo} from "../../../common/entities/Photo";
import {Directory} from "../../../common/entities/Directory";
import {Utils} from "../../../common/Utils";

@Injectable()
export class GalleryCacheService {


    public getDirectory(directoryName:string):Directory {
        let value = localStorage.getItem(directoryName);
        if (value != null) {
            let directory:Directory = JSON.parse(value);

            directory.photos.forEach((photo:Photo) => {
                photo.directory = directory;
            });

            return directory;
        }
        return null;
    }

    public setDirectory(directory:Directory):void {

        localStorage.setItem(Utils.concatUrls(directory.path, directory.name), JSON.stringify(directory));

        directory.directories.forEach((dir:Directory) => {
            let name = Utils.concatUrls(dir.path, dir.name);
            if (localStorage.getItem(name) == null) { //don't override existing
                localStorage.setItem(Utils.concatUrls(dir.path, dir.name), JSON.stringify(dir));
            }
        });

    }


}
