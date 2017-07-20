import {Component, ElementRef, HostListener, Input, OnChanges, ViewChild} from "@angular/core";
import {PhotoDTO} from "../../../../../common/entities/PhotoDTO";
import {Dimension} from "../../../model/IRenderable";
import {FullScreenService} from "../../fullscreen.service";
import {AgmMap} from "@agm/core";
import {IconThumbnail, ThumbnailManagerService} from "../../thumnailManager.service";
import {IconPhoto} from "../../IconPhoto";
import {Photo} from "../../Photo";

@Component({
  selector: 'gallery-map-lightbox',
  styleUrls: ['./lightbox.map.gallery.component.css'],
  templateUrl: './lightbox.map.gallery.component.html',
})
export class GalleryMapLightboxComponent implements OnChanges {

  @Input() photos: Array<PhotoDTO>;
  private startPosition = null;
  public lightboxDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public mapDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public visible = false;
  public opacity = 1.0;
  mapPhotos: MapPhoto[] = [];
  mapCenter = {latitude: 0, longitude: 0};

  @ViewChild("root") elementRef: ElementRef;

  @ViewChild(AgmMap) map: AgmMap;


  constructor(public fullScreenService: FullScreenService, private thumbnailService: ThumbnailManagerService) {


  }

//TODO: fix zooming
  ngOnChanges() {
    if (this.visible == false) {
      return;
    }
    this.showImages();
  }

  public show(position: Dimension) {
    this.visible = true;
    this.opacity = 1.0;
    this.startPosition = position;
    this.lightboxDimension = position;
    this.lightboxDimension.top -= this.getBodyScrollTop();
    this.mapDimension = <Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
    this.map.triggerResize();

    document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
    this.showImages();

    setTimeout(() => {
      this.lightboxDimension = <Dimension>{
        top: 0,
        left: 0,
        width: this.getScreenWidth(),
        height: this.getScreenHeight()
      };
    }, 0);
  }

  public hide() {
    this.fullScreenService.exitFullScreen();
    let to = this.startPosition;

    //iff target image out of screen -> scroll to there
    if (this.getBodyScrollTop() > to.top || this.getBodyScrollTop() + this.getScreenHeight() < to.top) {
      this.setBodyScrollTop(to.top);
    }

    this.lightboxDimension = this.startPosition;
    this.lightboxDimension.top -= this.getBodyScrollTop();
    document.getElementsByTagName('body')[0].style.overflowY = 'scroll';
    this.opacity = 0.0;
    setTimeout(() => {
      this.visible = false;
      this.hideImages();
    }, 500);


  }

  showImages() {
    this.hideImages();

    this.mapPhotos = this.photos.filter(p => {
      return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData;
    }).map(p => {
      let width = 500;
      let height = 500;
      if (p.metadata.size.width > p.metadata.size.height) {
        height = width * (p.metadata.size.height / p.metadata.size.width);
      } else {
        width = height * (p.metadata.size.width / p.metadata.size.height);
      }
      const iconTh = this.thumbnailService.getIcon(new IconPhoto(p));
      const obj: MapPhoto = {
        latitude: p.metadata.positionData.GPSData.latitude,
        longitude: p.metadata.positionData.GPSData.longitude,
        iconThumbnail: iconTh,
        preview: {
          width: width,
          height: height,
          url: (new Photo(p, width, height)).getThumbnailPath()
        }

      };
      if (iconTh.Available == true) {
        obj.iconUrl = iconTh.Src;
      } else {
        iconTh.OnLoad = () => {
          obj.iconUrl = iconTh.Src;
        };
      }
      return obj;
    });

    if (this.mapPhotos.length > 0) {
      this.mapCenter = this.mapPhotos[0];
    }
  }

  hideImages() {
    this.mapPhotos.forEach((mp) => mp.iconThumbnail.destroy());
    this.mapPhotos = [];
  }


  private getBodyScrollTop(): number {
    return window.scrollY;
  }

  private setBodyScrollTop(value: number) {
    window.scrollTo(window.scrollX, value);
  }

  private getScreenWidth() {
    return window.innerWidth;
  }

  private getScreenHeight() {
    return window.innerHeight;
  }

  //noinspection JSUnusedGlobalSymbols
  @HostListener('window:keydown', ['$event'])
  onKeyPress(e: KeyboardEvent) {
    if (this.visible != true) {
      return;
    }
    let event: KeyboardEvent = window.event ? <any>window.event : e;
    switch (event.keyCode) {
      case 27: //escape
        this.hide();
        break;
    }
  }


}

export interface MapPhoto {
  latitude: number;
  longitude: number;
  iconUrl?: string;
  iconThumbnail: IconThumbnail;
  preview: {
    width: number;
    height: number;
    url: string;
  }
}

