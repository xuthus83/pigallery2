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
import {animate, AnimationBuilder, style} from "@angular/animations";
import {GalleryLightboxPhotoComponent} from "./photo/photo.lightbox.gallery.component";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'gallery-lightbox',
  styleUrls: ['./lightbox.gallery.component.css'],
  templateUrl: './lightbox.gallery.component.html'
})
export class GalleryLightboxComponent implements OnDestroy {
  @Output('onLastElement') onLastElement = new EventEmitter();
  @ViewChild("root") elementRef: ElementRef;
  @ViewChild("photo") photoElement: GalleryLightboxPhotoComponent;
  @ViewChild("lightbox") lightboxElement: ElementRef;

  public navigation = {hasPrev: true, hasNext: true};
  public blackCanvasOpacity: any = 0;

  public activePhoto: GalleryPhotoComponent;
  private gridPhotoQL: QueryList<GalleryPhotoComponent>;

  public visible = false;
  private changeSubscription: Subscription = null;
  private timer: Observable<number>;
  private timerSub: Subscription;
  public playBackState: number = 0;
  public controllersDimmed = true;
  public controllersVisible = true;

  public infoPanelVisible = false;
  public infoPanelWidth = 0;


  constructor(public fullScreenService: FullScreenService,
              private changeDetector: ChangeDetectorRef, private overlayService: OverlayService,
              private _builder: AnimationBuilder) {
  }

  ngOnInit(): void {
    this.timer = Observable.timer(1000, 2000);
  }

  ngOnDestroy(): void {
    this.pause();
    if (this.changeSubscription != null) {
      this.changeSubscription.unsubscribe();
    }
  }

//noinspection JSUnusedGlobalSymbols
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.activePhoto) {
      this.animateLightbox();
      this.updateActivePhoto(this.activePhotoId);
    }
  }

  public nextImage() {
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
    this.pause();
    if (this.activePhotoId > 0) {
      this.showPhoto(this.activePhotoId - 1);
      return;
    }
    console.warn("can't find photo to show prev");
  }


  activePhotoId: number = null;

  private showPhoto(photoIndex: number, resize: boolean = true) {
    console.log("showing photo");
    this.activePhoto = null;
    this.changeDetector.detectChanges();
    this.updateActivePhoto(photoIndex, resize);
  }

  private updateActivePhoto(photoIndex: number, resize: boolean = true) {
    let pcList = this.gridPhotoQL.toArray();


    if (photoIndex < 0 || photoIndex > this.gridPhotoQL.length) {
      throw new Error("Can't find the photo");
    }
    this.activePhotoId = photoIndex;
    this.activePhoto = pcList[photoIndex];

    if (resize) {
      this.animatePhoto(this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo));
    }
    this.navigation.hasPrev = photoIndex > 0;
    this.navigation.hasNext = photoIndex + 1 < pcList.length;

    let to = this.activePhoto.getDimension();

    //if target image out of screen -> scroll to there
    if (this.getBodyScrollTop() > to.top || this.getBodyScrollTop() + this.getScreenHeight() < to.top) {
      this.setBodyScrollTop(to.top);
    }

  }

  startPhotoDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};

  public show(photo: PhotoDTO) {
    this.controllersVisible = true;
    this.showControls();
    console.log(this.photoElement);
    this.visible = true;
    let selectedPhoto = this.findPhotoComponent(photo);
    if (selectedPhoto === null) {
      throw new Error("Can't find Photo");
    }

    const lightboxDimension = selectedPhoto.getDimension();
    lightboxDimension.top -= this.getBodyScrollTop();
    this.animatePhoto(selectedPhoto.getDimension(), this.calcLightBoxPhotoDimension(selectedPhoto.gridPhoto.photo));
    this.animateLightbox(
      lightboxDimension,
      <Dimension>{
        top: 0,
        left: 0,
        width: this.getScreenWidth(),
        height: this.getScreenHeight()
      });


    this.blackCanvasOpacity = 0;
    this.startPhotoDimension = selectedPhoto.getDimension();
    //disable scroll
    this.overlayService.showOverlay();
    this.blackCanvasOpacity = 1.0;
    this.showPhoto(this.gridPhotoQL.toArray().indexOf(selectedPhoto), false);
  }

  public hide() {
    this.controllersVisible = false;
    this.fullScreenService.exitFullScreen();

    const lightboxDimension = this.activePhoto.getDimension();
    lightboxDimension.top -= this.getBodyScrollTop();
    this.blackCanvasOpacity = 0;

    this.animatePhoto(this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo), this.activePhoto.getDimension());
    this.animateLightbox(<Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    }, lightboxDimension);

    setTimeout(() => {
      this.visible = false;
      this.activePhoto = null;
      this.overlayService.hideOverlay();
    }, 500);

    this.hideInfoPanel(false);

  }

  animatePhoto(from: Dimension, to: Dimension = from) {
    this._builder.build([
      style(<any>Dimension.toString(from)),
      animate(300,
        style(<any>Dimension.toString(to)))
    ])
      .create(this.photoElement.elementRef.nativeElement)
      .play();
  }

  animateLightbox(from: Dimension = <Dimension>{
    top: 0,
    left: 0,
    width: this.getScreenWidth(),
    height: this.getScreenHeight()
  }, to: Dimension = from) {
    this._builder.build([
      style(<any>Dimension.toString(from)),
      animate(300,
        style(<any>Dimension.toString(to)))
    ])
      .create(this.lightboxElement.nativeElement)
      .play();
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

  private findPhotoComponent(photo: any): GalleryPhotoComponent {
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

  showInfoPanel() {
    this.infoPanelVisible = true;

    const starPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo);
    this.infoPanelWidth = 400;
    const endPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo);
    this.animatePhoto(starPhotoPos, endPhotoPos);
    this.animateLightbox(<Dimension>{
        top: 0,
        left: 0,
        width: this.getScreenWidth() + 400,
        height: this.getScreenHeight()
      },
      <Dimension>{
        top: 0,
        left: 0,
        width: this.getScreenWidth(),
        height: this.getScreenHeight()
      });
    if (this.iPvisibilityTimer != null) {
      clearTimeout(this.iPvisibilityTimer);
    }
  }

  hideInfoPanel(animate: boolean = true) {
    this.iPvisibilityTimer = setTimeout(() => {
      this.iPvisibilityTimer = null;
      this.infoPanelVisible = false;
    }, 1000);

    const starPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo);
    this.infoPanelWidth = 0;
    const endPhotoPos = this.calcLightBoxPhotoDimension(this.activePhoto.gridPhoto.photo);
    if (animate) {
      this.animatePhoto(starPhotoPos, endPhotoPos);
    }
    if (animate) {
      this.animateLightbox(<Dimension>{
          top: 0,
          left: 0,
          width: this.getScreenWidth() - 400,
          height: this.getScreenHeight()
        },
        <Dimension>{
          top: 0,
          left: 0,
          width: this.getScreenWidth(),
          height: this.getScreenHeight()
        });
    }
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

  visibilityTimer = null;

  @HostListener('mousemove')
  onMousemove() {
    this.showControls();
  }

  private showControls() {
    this.controllersDimmed = true;
    if (this.visibilityTimer != null) {
      clearTimeout(this.visibilityTimer);
    }
    this.visibilityTimer = setTimeout(this.hideControls, 2000);
  }

  private hideControls = () => {

    this.controllersDimmed = false;
  };

  public pause() {
    if (this.timerSub != null) {
      this.timerSub.unsubscribe();
    }
    this.playBackState = 0;
  }

  public play() {
    console.log("play");
    this.pause();
    this.timerSub = this.timer.filter(t => t % 2 == 0).subscribe(() => {
      if (this.navigation.hasNext) {
        this.nextImage();
      } else {
        this.showPhoto(0);
      }
    });
    this.playBackState = 1;
  }

  public fastForward() {
    console.log("fastForward");
    this.pause();
    this.timerSub = this.timer.subscribe(() => {
      if (this.navigation.hasNext) {
        this.nextImage();
      } else {
        this.showPhoto(0);
      }
    });
    this.playBackState = 2;
  }
}

