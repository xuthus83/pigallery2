import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {PhotoDTO} from '../../../../common/entities/PhotoDTO';
import {GridRowBuilder} from './GridRowBuilder';
import {GalleryLightboxComponent} from '../lightbox/lightbox.gallery.component';
import {GridPhoto} from './GridPhoto';
import {GalleryPhotoComponent} from './photo/photo.grid.gallery.component';
import {OverlayService} from '../overlay.service';
import {Config} from '../../../../common/config/public/Config';

@Component({
  selector: 'app-gallery-grid',
  templateUrl: './grid.gallery.component.html',
  styleUrls: ['./grid.gallery.component.css'],
})
export class GalleryGridComponent implements OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('gridContainer') gridContainer: ElementRef;
  @ViewChildren(GalleryPhotoComponent) gridPhotoQL: QueryList<GalleryPhotoComponent>;

  @Input() photos: Array<PhotoDTO>;
  @Input() lightbox: GalleryLightboxComponent;

  photosToRender: Array<GridPhoto> = [];
  containerWidth = 0;

  public IMAGE_MARGIN = 2;
  private TARGET_COL_COUNT = 5;
  private MIN_ROW_COUNT = 2;
  private MAX_ROW_COUNT = 5;

  private onScrollFired = false;
  private scrollbarWidth = 0;
  private helperTime = null;
  isAfterViewInit = false;
  private renderedPhotoIndex = 0;

  constructor(private overlayService: OverlayService,
              private changeDetector: ChangeDetectorRef) {
  }

  ngOnChanges() {
    if (this.isAfterViewInit === false) {
      return;
    }
    this.updateContainerWidth();
    this.sortPhotos();
    this.mergeNewPhotos();
    this.helperTime = setTimeout(() => {
      this.renderPhotos();
    }, 0);
  }

  ngOnDestroy() {

    if (this.helperTime != null) {
      clearTimeout(this.helperTime);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isAfterViewInit === false) {
      return;
    }
    this.updateContainerWidth();
    this.sortPhotos();
    // render the same amount of images on resize
    const renderedIndex = this.renderedPhotoIndex;
    this.clearRenderedPhotos();
    this.renderPhotos(renderedIndex);
  }


  ngAfterViewInit() {
    this.lightbox.setGridPhotoQL(this.gridPhotoQL);


    this.updateContainerWidth();
    this.sortPhotos();
    this.clearRenderedPhotos();
    this.helperTime = setTimeout(() => {
      this.renderPhotos();
    }, 0);
    this.isAfterViewInit = true;
  }

  public renderARow(): number {
    if (this.renderedPhotoIndex >= this.photos.length) {
      return null;
    }


    let maxRowHeight = window.innerHeight / this.MIN_ROW_COUNT;
    const minRowHeight = window.innerHeight / this.MAX_ROW_COUNT;

    const photoRowBuilder = new GridRowBuilder(this.photos,
      this.renderedPhotoIndex,
      this.IMAGE_MARGIN,
      this.containerWidth - this.overlayService.getPhantomScrollbarWidth()
    );

    photoRowBuilder.addPhotos(this.TARGET_COL_COUNT);
    photoRowBuilder.adjustRowHeightBetween(minRowHeight, maxRowHeight);

    // little trick: We don't want too big single images. But if a little extra height helps fit the row, its ok
    if (photoRowBuilder.getPhotoRow().length > 1) {
      maxRowHeight *= 1.2;
    }
    const rowHeight = Math.min(photoRowBuilder.calcRowHeight(), maxRowHeight);
    const imageHeight = rowHeight - (this.IMAGE_MARGIN * 2);

    photoRowBuilder.getPhotoRow().forEach((photo) => {
      const imageWidth = imageHeight * (photo.metadata.size.width / photo.metadata.size.height);
      this.photosToRender.push(new GridPhoto(photo, imageWidth, imageHeight, this.renderedPhotoIndex));
    });

    this.renderedPhotoIndex += photoRowBuilder.getPhotoRow().length;
    return rowHeight;
  }

  private clearRenderedPhotos() {
    this.photosToRender = [];
    this.renderedPhotoIndex = 0;
    this.changeDetector.detectChanges();
  }

  private sortPhotos() {
    // sort pohots by date
    this.photos.sort((a: PhotoDTO, b: PhotoDTO) => {
      return a.metadata.creationDate - b.metadata.creationDate;
    });

  }

  private mergeNewPhotos() {
    // merge new data with old one
    let lastSameIndex = 0;
    let lastRowId = null;
    for (let i = 0; i < this.photos.length && i < this.photosToRender.length; i++) {

      // thIf a photo changed the whole row has to be removed
      if (this.photosToRender[i].rowId !== lastRowId) {
        lastSameIndex = i;
        lastRowId = this.photosToRender[i].rowId;
      }
      if (this.photosToRender[i].equals(this.photos[i]) === false) {
        break;
      }
    }

    if (lastSameIndex > 0) {
      this.photosToRender.splice(lastSameIndex, this.photosToRender.length - lastSameIndex);
      this.renderedPhotoIndex = lastSameIndex;
    } else {
      this.clearRenderedPhotos();
    }
  }


  /**
   * Returns true, if scroll is >= 70% to render more images.
   * Or of onscroll rendering is off: return always to render all the images at once
   * @param offset Add height to the client height (conent is not yet added to the dom, but calculate with it)
   * @returns {boolean}
   */
  private shouldRenderMore(offset: number = 0): boolean {
    return Config.Client.enableOnScrollRendering === false ||
      window.scrollY >= (document.body.clientHeight + offset - window.innerHeight) * 0.7
      || (document.body.clientHeight + offset) * 0.85 < window.innerHeight;

  }


  @HostListener('window:scroll')
  onScroll() {
    if (!this.onScrollFired) {
      window.requestAnimationFrame(() => {
        this.renderPhotos();

        if (Config.Client.enableOnScrollThumbnailPrioritising === true) {
          this.gridPhotoQL.toArray().forEach((pc: GalleryPhotoComponent) => {
            pc.onScroll();
          });
        }
        this.onScrollFired = false;
      });
      this.onScrollFired = true;
    }
  }

  private renderPhotos(numberOfPhotos: number = 0) {
    if (this.containerWidth === 0 ||
      this.renderedPhotoIndex >= this.photos.length ||
      !this.shouldRenderMore()) {
      return;
    }


    let renderedContentHeight = 0;

    while (this.renderedPhotoIndex < this.photos.length &&
    (this.shouldRenderMore(renderedContentHeight) === true ||
      this.renderedPhotoIndex < numberOfPhotos)) {
      const ret = this.renderARow();
      if (ret === null) {
        throw new Error('Grid photos rendering failed');
      }
      renderedContentHeight += ret;
    }
  }

  private updateContainerWidth(): number {
    if (!this.gridContainer) {
      return;
    }
    this.containerWidth = this.gridContainer.nativeElement.clientWidth;
  }


}



