import {Photo} from "../../../../common/entities/Photo";
import {Config} from "../../config/Config";
import {Utils} from "../../../../common/Utils";
export class GridPhoto {
    constructor(public photo:Photo, public renderWidth:number, public renderHeight:number) {

    }


    thumbnailLoaded() {
        if (!this.isThumbnailAvailable()) {
            this.photo.readyThumbnails.push(this.getThumbnailSize());
        }
    }

    getThumbnailSize() {
        let renderSize = Math.sqrt(this.renderWidth * this.renderHeight);
        return Utils.findClosest(renderSize, Config.Client.thumbnailSizes);
    }

    isThumbnailAvailable() {
        return this.photo.readyThumbnails.indexOf(this.getThumbnailSize()) != -1;
    }
    
    getThumbnailPath() {
        let size = this.getThumbnailSize();
        return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name, "thumbnail", size.toString());
    }

    getPhotoPath() {
        return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name);
    }
}