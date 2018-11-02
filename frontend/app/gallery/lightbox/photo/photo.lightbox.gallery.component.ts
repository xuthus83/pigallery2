import {Component, ElementRef, Input, OnChanges} from '@angular/core';
import {GridPhoto} from '../../grid/GridPhoto';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {FixOrientationPipe} from '../../FixOrientationPipe';

@Component({
  selector: 'app-gallery-lightbox-photo',
  styleUrls: ['./photo.lightbox.gallery.component.css'],
  templateUrl: './photo.lightbox.gallery.component.html'
})
export class GalleryLightboxPhotoComponent implements OnChanges {

  @Input() gridPhoto: GridPhoto;
  @Input() loadImage = false;
  @Input() windowAspect = 1;
  prevGirdPhoto = null;

  public imageSize = {width: 'auto', height: '100'};

  private imageLoaded = false;
  public imageLoadFinished = false;

  thumbnailSrc: string = null;
  photoSrc: string = null;

  constructor(public elementRef: ElementRef) {
  }

  ngOnChanges() {
    this.imageLoaded = false;
    this.imageLoadFinished = false;
    this.setImageSize();
    if (this.prevGirdPhoto !== this.gridPhoto) {
      this.prevGirdPhoto = this.gridPhoto;
      this.thumbnailSrc = null;
      this.photoSrc = null;
    }
    if (this.thumbnailSrc == null && this.gridPhoto && this.ThumbnailUrl !== null) {
      FixOrientationPipe.transform(this.ThumbnailUrl, this.gridPhoto.photo.metadata.orientation)
        .then((src) => this.thumbnailSrc = src);
    }

    if (this.photoSrc == null && this.gridPhoto && this.loadImage) {
      FixOrientationPipe.transform(this.gridPhoto.getPhotoPath(), this.gridPhoto.photo.metadata.orientation)
        .then((src) => this.thumbnailSrc = src);
    }
  }

  onImageError() {
    // TODO:handle error
    this.imageLoadFinished = true;
    console.error('Error: cannot load image for lightbox url: ' + this.gridPhoto.getPhotoPath());
  }


  onImageLoad() {
    this.imageLoadFinished = true;
    this.imageLoaded = true;
  }

  private get ThumbnailUrl(): string {
    if (this.gridPhoto.isThumbnailAvailable() === true) {
      return this.gridPhoto.getThumbnailPath();
    }

    if (this.gridPhoto.isReplacementThumbnailAvailable() === true) {
      return this.gridPhoto.getReplacementThumbnailPath();
    }
    return null;
  }

  public get PhotoSrc(): string {
    return this.gridPhoto.getPhotoPath();
  }

  public showThumbnail(): boolean {
    return this.gridPhoto &&
      !this.imageLoaded &&
      this.thumbnailSrc !== null &&
      (this.gridPhoto.isThumbnailAvailable() || this.gridPhoto.isReplacementThumbnailAvailable());
  }

  private setImageSize() {
    if (!this.gridPhoto) {
      return;
    }


    const photoAspect = PhotoDTO.calcRotatedAspectRatio(this.gridPhoto.photo);

    if (photoAspect < this.windowAspect) {
      this.imageSize.height = '100';
      this.imageSize.width = null;
    } else {
      this.imageSize.height = null;
      this.imageSize.width = '100';
    }
  }

}

