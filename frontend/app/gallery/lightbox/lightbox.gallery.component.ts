import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  QueryList,
  ViewChild
} from "@angular/core";
import {PhotoDTO} from "../../../../common/entities/PhotoDTO";
import {GalleryPhotoComponent} from "../grid/photo/photo.grid.gallery.component";
import {Dimension} from "../../model/IRenderable";
import {FullScreenService} from "../fullscreen.service";
import {OverlayService} from "../overlay.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'gallery-lightbox',
  styleUrls: ['./lightbox.gallery.component.css'],
  templateUrl: './lightbox.gallery.component.html',
})
export class GalleryLightboxComponent implements OnDestroy {
  @Output('onLastElement') onLastElement = new EventEmitter();
  @ViewChild("root") elementRef: ElementRef;

  public navigation = {hasPrev: true, hasNext: true};
  public photoDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public lightboxDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public transition: string = "";
  public blackCanvasOpacity: any = 0;

  public activePhoto: GalleryPhotoComponent;
  private gridPhotoQL: QueryList<GalleryPhotoComponent>;

  public visible = false;
  private changeSubscription: Subscription = null;


  public infoPanelVisible = false;
  public infoPanelWidth = 0;
  public contentWidth = 0;


  constructor(public fullScreenService: FullScreenService, private changeDetector: ChangeDetectorRef, private overlayService: OverlayService) {
  }


  ngOnDestroy(): void {
    if (this.changeSubscription != null) {
      this.changeSubscription.unsubscribe();
    }
  }

//noinspection JSUnusedGlobalSymbols
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.activePhoto) {
      this.disableAnimation();
      this.lightboxDimension.width = this.getScreenWidth();
      this.lightboxDimension.height = this.getScreenHeight();
      this.updateActivePhoto(this.activePhotoId);
    }
  }

  public nextImage() {
    this.disableAnimation();
    if (this.activePhotoId + 1 < this.gridPhotoQL.length) {
      this.showPhoto(this.activePhotoId + 1);
      if (this.activePhotoId + 3 >= this.gridPhotoQL.length) {
        this.onLastElement.emit({}); //trigger to render more photos if there are
      }
      return;
    }
    console.warn("can't find photo to show next");
  }

  public prevImage() {
    this.disableAnimation();
    if (this.activePhotoId > 0) {
      this.showPhoto(this.activePhotoId - 1);
      return;
    }
    console.warn("can't find photo to show prev");
  }


  activePhotoId: number = null;

  private showPhoto(photoIndex: number) {
    this.activePhoto = null;
    this.changeDetector.detectChanges();
    this.updateActivePhoto(photoIndex);
  }

  private updateActivePhoto(photoIndex: number) {
    let pcList = this.gridPhotoQL.toArray();


    if (photoIndex < 0 || photoIndex > this.gridPhotoQL.length) {
      throw new Error("Can't find the photo");
    }
    this.activePhotoId = photoIndex;
    this.activePhoto = pcList[photoIndex];

    this.photoDimension = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo);
    this.navigation.hasPrev = photoIndex > 0;
    this.navigation.hasNext = photoIndex + 1 < pcList.length;

    let to = this.activePhoto.getDimension();

    //if target image out of screen -> scroll to there
    if (this.getBodyScrollTop() > to.top || this.getBodyScrollTop() + this.getScreenHeight() < to.top) {
      this.setBodyScrollTop(to.top);
    }

  }

  public show(photo: PhotoDTO) {
    this.enableAnimation();
    this.visible = true;
    let selectedPhoto = this.findPhotoComponent(photo);
    if (selectedPhoto === null) {
      throw new Error("Can't find Photo");
    }

    this.lightboxDimension = selectedPhoto.getDimension();
    this.lightboxDimension.top -= this.getBodyScrollTop();
    this.blackCanvasOpacity = 0;
    this.photoDimension = selectedPhoto.getDimension();

    //disable scroll
    this.overlayService.showOverlay();
    setTimeout(() => {
      this.lightboxDimension = <Dimension>{
        top: 0,
        left: 0,
        width: this.getScreenWidth(),
        height: this.getScreenHeight()
      };
      this.blackCanvasOpacity = 1.0;
      this.showPhoto(this.gridPhotoQL.toArray().indexOf(selectedPhoto));
      this.contentWidth = this.getScreenWidth();
    }, 0);
  }

  public hide() {
    this.enableAnimation();
    this.hideInfoPanel();
    this.fullScreenService.exitFullScreen();

    this.lightboxDimension = this.activePhoto.getDimension();
    this.lightboxDimension.top -= this.getBodyScrollTop();
    this.blackCanvasOpacity = 0;
    this.photoDimension = this.activePhoto.getDimension();
    setTimeout(() => {
      this.visible = false;
      this.activePhoto = null;
      this.overlayService.hideOverlay();
    }, 500);

  }


  setGridPhotoQL(value: QueryList<GalleryPhotoComponent>) {
    if (this.changeSubscription != null) {
      this.changeSubscription.unsubscribe();
    }
    this.gridPhotoQL = value;
    this.changeSubscription = this.gridPhotoQL.changes.subscribe(() => {
      if (this.activePhotoId != null && this.gridPhotoQL.length > this.activePhotoId) {
        this.updateActivePhoto(this.activePhotoId);
      }
    });
  }

  private findPhotoComponent(photo: any) {
    let galleryPhotoComponents = this.gridPhotoQL.toArray();
    for (let i = 0; i < galleryPhotoComponents.length; i++) {
      if (galleryPhotoComponents[i].gridPhoto.photo == photo) {
        return galleryPhotoComponents[i];
      }
    }
    return null;
  }

  //noinspection JSUnusedGlobalSymbols
  @HostListener('window:keydown', ['$event'])
  onKeyPress(e: KeyboardEvent) {
    if (this.visible != true) {
      return;
    }
    let event: KeyboardEvent = window.event ? <any>window.event : e;
    switch (event.keyCode) {
      case 37:
        if (this.activePhotoId > 0) {
          this.prevImage();
        }
        break;
      case 39:
        if (this.activePhotoId < this.gridPhotoQL.length - 1) {
          this.nextImage();
        }
        break;
      case 27: //escape
        this.hide();
        break;
    }
  }

  iPvisibilityTimer = null;

  public toggleInfoPanel() {


    if (this.infoPanelWidth != 400) {
      this.showInfoPanel();
    } else {
      this.hideInfoPanel();
    }

  }

  recalcPositions() {

    this.photoDimension = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo);
    this.contentWidth = this.getScreenWidth();
    this.lightboxDimension = <Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
  };

  showInfoPanel() {
    this.infoPanelVisible = true;
    this.infoPanelWidth = 0;
    setTimeout(() => {
      this.infoPanelWidth = 400;
      this.recalcPositions();
    }, 0);
    if (this.iPvisibilityTimer != null) {
      clearTimeout(this.iPvisibilityTimer);
    }
  }

  hideInfoPanel() {
    this.infoPanelWidth = 0;
    this.iPvisibilityTimer = setTimeout(() => {
      this.iPvisibilityTimer = null;
      this.infoPanelVisible = false;
    }, 1000);
    this.recalcPositions();
  }

  private enableAnimation() {
    this.transition = null;
  }

  private disableAnimation() {
    this.transition = "initial";
  }


  private getBodyScrollTop(): number {
    return window.scrollY;
  }

  private setBodyScrollTop(value: number) {
    window.scrollTo(window.scrollX, value);
  }

  private getScreenWidth() {
    return Math.max(window.innerWidth - this.infoPanelWidth, 0);
  }

  private getScreenHeight() {
    return window.innerHeight;
  }


  private calcLightBoxPhotoDimension(photo: PhotoDTO): Dimension {
    let width = 0;
    let height = 0;
    if (photo.metadata.size.height > photo.metadata.size.width) {
      width = Math.round(photo.metadata.size.width * (this.getScreenHeight() / photo.metadata.size.height));
      height = this.getScreenHeight();
    } else {
      width = this.getScreenWidth();
      height = Math.round(photo.metadata.size.height * (this.getScreenWidth() / photo.metadata.size.width));
    }
    let top = (this.getScreenHeight() / 2 - height / 2);
    let left = (this.getScreenWidth() / 2 - width / 2);

    return <Dimension>{top: top, left: left, width: width, height: height};
  }
}

