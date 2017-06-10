import {PhotoDTO} from "../../../common/entities/PhotoDTO";
import {Utils} from "../../../common/Utils";
import {IconPhoto} from "./IconPhoto";
import {Config} from "../../../common/config/public/Config";
export class Photo extends IconPhoto {


  constructor(photo: PhotoDTO, public renderWidth: number, public renderHeight: number) {
    super(photo);
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

  getReplacementThumbnailSize(): number {

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
    return <number>this.replacementSizeCache;
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


}
