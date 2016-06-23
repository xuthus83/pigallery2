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

    getReplacementThumbnailSize() {
        let size = this.getThumbnailSize();
        for (let i = 0; i < this.photo.readyThumbnails.length; i++) {
            if (this.photo.readyThumbnails[i] < size) {
                return this.photo.readyThumbnails[i];
            }
        }
        return null;
    }

    isReplacementThumbnailAvailable() {
        return this.getReplacementThumbnailSize() !== null;
    }
    
    isThumbnailAvailable() {
        return this.photo.readyThumbnails.indexOf(this.getThumbnailSize()) != -1;
    }

    getReplacementThumbnailPath() {
        let size = this.getReplacementThumbnailSize();
        return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name, "thumbnail", size.toString());

    }
    
    getThumbnailPath() {
        let size = this.getThumbnailSize();
        return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name, "thumbnail", size.toString());
    }

    getPhotoPath() {
        return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name);
    }
}