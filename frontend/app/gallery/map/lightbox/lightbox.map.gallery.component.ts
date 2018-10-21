import {Component, ElementRef, HostListener, Input, OnChanges, ViewChild, AfterViewInit} from '@angular/core';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {Dimension} from '../../../model/IRenderable';
import {FullScreenService} from '../../fullscreen.service';
import {AgmMap, LatLngBounds, MapsAPILoader} from '@agm/core';
import {IconThumbnail, Thumbnail, ThumbnailManagerService} from '../../thumnailManager.service';
import {IconPhoto} from '../../IconPhoto';
import {Photo} from '../../Photo';
import {PageHelper} from '../../../model/page.helper';


@Component({
  selector: 'app-gallery-map-lightbox',
  styleUrls: ['./lightbox.map.gallery.component.css'],
  templateUrl: './lightbox.map.gallery.component.html',
})
export class GalleryMapLightboxComponent implements OnChanges, AfterViewInit {

  @Input() photos: Array<PhotoDTO>;
  private startPosition = null;
  public lightboxDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public mapDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
  public visible = false;
  public controllersVisible = false;
  public opacity = 1.0;
  mapPhotos: MapPhoto[] = [];
  mapCenter = {latitude: 0, longitude: 0};

  @ViewChild('root') elementRef: ElementRef;

  @ViewChild(AgmMap) map: AgmMap;


  constructor(public fullScreenService: FullScreenService,
              private thumbnailService: ThumbnailManagerService,
              private mapsAPILoader: MapsAPILoader) {
  }

  ngOnChanges() {
    if (this.visible === false) {
      return;
    }
    this.showImages();
  }

  ngAfterViewInit() {

  }

  public show(position: Dimension) {
    this.hideImages();
    this.visible = true;
    this.opacity = 1.0;
    this.startPosition = position;
    this.lightboxDimension = position;
    this.lightboxDimension.top -= PageHelper.ScrollY;
    this.mapDimension = <Dimension>{
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    };
    this.map.triggerResize().then(() => {
      this.controllersVisible = true;
    });

    PageHelper.hideScrollY();

    setTimeout(() => {
      this.lightboxDimension = <Dimension>{
        top: 0,
        left: 0,
        width: this.getScreenWidth(),
        height: this.getScreenHeight()
      };
      this.showImages();
    }, 0);
  }

  public hide() {
    this.fullScreenService.exitFullScreen();
    this.controllersVisible = false;
    const to = this.startPosition;

    // iff target image out of screen -> scroll to there
    if (PageHelper.ScrollY > to.top || PageHelper.ScrollY + this.getScreenHeight() < to.top) {
      PageHelper.ScrollY = to.top;
    }

    this.lightboxDimension = this.startPosition;
    this.lightboxDimension.top -= PageHelper.ScrollY;
    PageHelper.showScrollY();
    this.opacity = 0.0;
    setTimeout(() => {
      this.visible = false;
      this.hideImages();
    }, 500);
  }

  showImages() {
    this.hideImages();

    this.mapPhotos = this.photos.filter(p => {
      return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData
        && p.metadata.positionData.GPSData.latitude
        && p.metadata.positionData.GPSData.longitude;
    }).map(p => {
      let width = 500;
      let height = 500;
      if (p.metadata.size.width > p.metadata.size.height) {
        height = width * (p.metadata.size.height / p.metadata.size.width);
      } else {
        width = height * (p.metadata.size.width / p.metadata.size.height);
      }
      const iconTh = this.thumbnailService.getIcon(new IconPhoto(p));
      iconTh.Visible = true;
      const obj: MapPhoto = {
        latitude: p.metadata.positionData.GPSData.latitude,
        longitude: p.metadata.positionData.GPSData.longitude,
        iconThumbnail: iconTh,
        preview: {
          width: width,
          height: height,
          thumbnail: this.thumbnailService.getLazyThumbnail(new Photo(p, width, height))
        }

      };
      if (iconTh.Available === true) {
        obj.iconUrl = iconTh.Src;
      } else {
        iconTh.OnLoad = () => {
          obj.iconUrl = iconTh.Src;
        };
      }
      return obj;
    });

  }


  public loadPreview(mp: MapPhoto) {
    mp.preview.thumbnail.load();
    mp.preview.thumbnail.CurrentlyWaiting = true;
  }

  hideImages() {
    this.mapCenter = {longitude: 0, latitude: 0};
    this.mapPhotos.forEach((mp) => {
      mp.iconThumbnail.destroy();
      mp.preview.thumbnail.destroy();
    });
    this.mapPhotos = [];
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
    if (this.visible !== true) {
      return;
    }
    const event: KeyboardEvent = window.event ? <any>window.event : e;
    switch (event.key) {
      case 'Escape': // escape
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
    thumbnail: Thumbnail;
  };
}

