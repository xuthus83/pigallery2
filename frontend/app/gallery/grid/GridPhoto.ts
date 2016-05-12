import {Photo} from "../../../../common/entities/Photo";
import {Config} from "../../config/Config";
import {Utils} from "../../../../common/Utils";
export class GridPhoto {
    constructor(public photo:Photo, public renderWidth:number, public renderHeight:number) {

    }

    getThumbnailPath() {
        let renderSize = Math.sqrt(this.renderWidth * this.renderHeight);
        let size = Utils.findClosest(renderSize, Config.Client.thumbnailSizes);
        return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name, "thumbnail", size.toString());
    }

    getPhotoPath() {
        return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name);
    }
}