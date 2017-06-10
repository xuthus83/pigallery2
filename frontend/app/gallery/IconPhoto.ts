import {PhotoDTO} from "../../../common/entities/PhotoDTO";
import {Utils} from "../../../common/Utils";
export class IconPhoto {


  protected replacementSizeCache: number | boolean = false;

  constructor(public photo: PhotoDTO) {

  }

  iconLoaded() {
    this.photo.readyIcon = true;
  }

  isIconAvailable() {
    return this.photo.readyIcon;
  }

  getIconPath() {
    return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name, "icon");
  }

  getPhotoPath() {
    return Utils.concatUrls("/api/gallery/content/", this.photo.directory.path, this.photo.directory.name, this.photo.name);
  }


  equals(other: PhotoDTO | IconPhoto): boolean {
    //is gridphoto
    if (other instanceof IconPhoto) {
      return this.photo.directory.path === other.photo.directory.path && this.photo.directory.name === other.photo.directory.name && this.photo.name === other.photo.name
    }

    //is photo
    if (other.directory) {
      return this.photo.directory.path === other.directory.path && this.photo.directory.name === other.directory.name && this.photo.name === other.name
    }

    return false;
  }
}
