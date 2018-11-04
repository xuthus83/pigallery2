import {Component, ElementRef, Input, OnChanges} from '@angular/core';
import {GridMedia} from '../../grid/GridMedia';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {FixOrientationPipe} from '../../FixOrientationPipe';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';

@Component({
  selector: 'app-gallery-lightbox-photo',
  styleUrls: ['./photo.lightbox.gallery.component.css'],
  templateUrl: './photo.lightbox.gallery.component.html'
})
export class GalleryLightboxPhotoComponent implements OnChanges {

  @Input() gridMedia: GridMedia;
  @Input() loadMedia = false;
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
    if (this.prevGirdPhoto !== this.gridMedia) {
      this.prevGirdPhoto = this.gridMedia;
      this.thumbnailSrc = null;
      this.photoSrc = null;
    }
    if (this.thumbnailSrc == null && this.gridMedia && this.ThumbnailUrl !== null) {
      FixOrientationPipe.transform(this.ThumbnailUrl, this.gridMedia.Orientation)
        .then((src) => this.thumbnailSrc = src);
    }

    if (this.photoSrc == null && this.gridMedia && this.loadMedia) {
      FixOrientationPipe.transform(this.gridMedia.getPhotoPath(), this.gridMedia.Orientation)
        .then((src) => this.photoSrc = src);
    }
  }

  onImageError() {
    // TODO:handle error
    this.imageLoadFinished = true;
    console.error('Error: cannot load image for lightbox url: ' + this.gridMedia.getPhotoPath());
  }

  logevent(ev) {
    console.log(ev);
    this.imageLoadFinished = true;
    this.imageLoaded = true;
  }

  onImageLoad() {
    this.imageLoadFinished = true;
    this.imageLoaded = true;
  }

  private get ThumbnailUrl(): string {
    if (this.gridMedia.isThumbnailAvailable() === true) {
      return this.gridMedia.getThumbnailPath();
    }

    if (this.gridMedia.isReplacementThumbnailAvailable() === true) {
      return this.gridMedia.getReplacementThumbnailPath();
    }
    return null;
  }

  public get PhotoSrc(): string {
    return this.gridMedia.getPhotoPath();
  }

  public showThumbnail(): boolean {
    return this.gridMedia &&
      !this.imageLoaded &&
      this.thumbnailSrc !== null &&
      (this.gridMedia.isThumbnailAvailable() || this.gridMedia.isReplacementThumbnailAvailable());
  }

  private setImageSize() {
    if (!this.gridMedia) {
      return;
    }


    const photoAspect = MediaDTO.calcRotatedAspectRatio(this.gridMedia.media);

    if (photoAspect < this.windowAspect) {
      this.imageSize.height = '100';
      this.imageSize.width = null;
    } else {
      this.imageSize.height = null;
      this.imageSize.width = '100';
    }
  }

}

