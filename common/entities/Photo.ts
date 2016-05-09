import {Utils} from "../Utils";
import {Directory} from "./Directory";
export class Photo {
    constructor(public id?:number, public name?:string, public directory?:Directory, public width?:number, public height?:number) {
    }

    public static getThumbnailPath(photo:Photo) {
        return Utils.concatUrls("/api/gallery/content/", photo.directory.path, photo.directory.name, photo.name, "thumbnail");
    }

    public static  getPhotoPath(photo:Photo) {
        return Utils.concatUrls("/api/gallery/content/", photo.directory.path, photo.directory.name, photo.name);
    }
}