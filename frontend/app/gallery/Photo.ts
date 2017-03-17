import {PhotoDTO} from "../../../common/entities/PhotoDTO";
import {Utils} from "../../../common/Utils";
import {Config} from "../config/Config";
export class Photo {

    protected replacementSizeCache: boolean|number = false;

    constructor(public photo: PhotoDTO, public renderWidth: number, public renderHeight: number) {

    }


    thumbnailLoaded() {
        if (!this.isThumbnailAvailable()) {
            this.photo.readyThumbnails = this.photo.readyThumbnails || [];
            this.photo.readyThumbnails.push(this.getThumbnailSize());
        }
    }

    getThumbnailSize() {
        let renderSize = Math.sqrt(this.renderWidth * this.renderHeight);
        return Utils.findClosest(renderSize, Config.Client.thumbnailSizes);
    }

    getReplacementThumbnailSize() {

        if (this.replacementSizeCache === false) {
            this.replacementSizeCache = null;

            let size = this.getThumbnailSize();
            if (!!this.photo.readyThumbnails) {
                for (let i = 0; i < this.photo.readyThumbnails.length; i++) {
                    if (this.photo.readyThumbnails[i] < size) {
                        this.replacementSizeCache = this.photo.readyThumbnails[i];
                        break;
                    }
                }
            }
        }
        return this.replacementSizeCache;
    }

    isReplacementThumbnailAvailable() {
        return this.getReplacementThumbnailSize() !== null;
    }

    isThumbnailAvailable() {
        return this.photo.readyThumbnails && this.photo.readyThumbnails.indexOf(this.getThumbnailSize()) != -1;
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


    equals(other: any) {
        //is gridphoto
        if (other.photo) {
            return this.photo.directory.path === other.photo.directory.path && this.photo.directory.name === other.photo.directory.name && this.photo.name === other.photo.name
        }

        //is photo
        if (other.directory) {
            return this.photo.directory.path === other.directory.path && this.photo.directory.name === other.directory.name && this.photo.name === other.name
        }

        return false;
    }
}