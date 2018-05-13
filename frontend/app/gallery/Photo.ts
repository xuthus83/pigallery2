import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {Utils} from '../../../common/Utils';
import {IconPhoto} from './IconPhoto';
import {Config} from '../../../common/config/public/Config';

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
    const renderSize = Math.sqrt(this.renderWidth * this.renderHeight);
    return Utils.findClosest(renderSize, Config.Client.Thumbnail.thumbnailSizes);
  }

  getReplacementThumbnailSize(): number {

    if (this.replacementSizeCache === false) {
      this.replacementSizeCache = null;

      const size = this.getThumbnailSize();
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
    return this.photo.readyThumbnails && this.photo.readyThumbnails.indexOf(this.getThumbnailSize()) !== -1;
  }

  getReplacementThumbnailPath() {
    const size = this.getReplacementThumbnailSize();
    return Utils.concatUrls(Config.Client.urlBase,
      '/api/gallery/content/',
      this.photo.directory.path, this.photo.directory.name, this.photo.name, 'thumbnail', size.toString());

  }

  hasPositionData(): boolean {
    return PhotoDTO.hasPositionData(this.photo);
  }

  getThumbnailPath() {
    const size = this.getThumbnailSize();
    return Utils.concatUrls(Config.Client.urlBase,
      '/api/gallery/content/',
      this.photo.directory.path, this.photo.directory.name, this.photo.name, 'thumbnail', size.toString());
  }


}
