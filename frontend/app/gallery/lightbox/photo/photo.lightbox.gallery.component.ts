import {Component, ElementRef, Input, OnChanges} from '@angular/core';
import {GridPhoto} from '../../grid/GridPhoto';

@Component({
  selector: 'app-gallery-lightbox-photo',
  styleUrls: ['./photo.lightbox.gallery.component.css'],
  templateUrl: './photo.lightbox.gallery.component.html'
})
export class GalleryLightboxPhotoComponent implements OnChanges {

  @Input() gridPhoto: GridPhoto;
  @Input() loadImage = false;
  @Input() windowAspect = 1;

  public imageSize = {width: 'auto', height: '100'};

  imageLoaded = false;
  public imageLoadFinished = false;

  constructor(public elementRef: ElementRef) {
  }

  ngOnChanges() {

    this.imageLoaded = false;
    this.imageLoadFinished = false;
    this.setImageSize();
  }

  onImageError() {
    // TODO:handle error
    this.imageLoadFinished = true;
    console.error('cant load image');
  }


  onImageLoad() {
    this.imageLoadFinished = true;
    this.imageLoaded = true;
  }

  public thumbnailPath(): string {
    if (this.gridPhoto.isThumbnailAvailable() === true) {
      return this.gridPhoto.getThumbnailPath();
    }

    if (this.gridPhoto.isReplacementThumbnailAvailable() === true) {
      return this.gridPhoto.getReplacementThumbnailPath();
    }
    return null;
  }

  public showThumbnail(): boolean {
    return this.gridPhoto && !this.imageLoaded &&
      (this.gridPhoto.isThumbnailAvailable() || this.gridPhoto.isReplacementThumbnailAvailable());
  }

  private setImageSize() {
    if (!this.gridPhoto) {
      return;
    }


    const photoAspect = this.gridPhoto.photo.metadata.size.width / this.gridPhoto.photo.metadata.size.height;

    if (photoAspect < this.windowAspect) {
      this.imageSize.height = '100';
      this.imageSize.width = null;
    } else {
      this.imageSize.height = null;
      this.imageSize.width = '100';
    }
  }

}

