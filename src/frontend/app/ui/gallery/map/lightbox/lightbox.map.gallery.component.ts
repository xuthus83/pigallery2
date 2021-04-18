import {AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, ViewChild} from '@angular/core';
import {PhotoDTO} from '../../../../../../common/entities/PhotoDTO';
import {Dimension} from '../../../../model/IRenderable';
import {FullScreenService} from '../../fullscreen.service';
import {IconThumbnail, Thumbnail, ThumbnailManagerService} from '../../thumbnailManager.service';
import {MediaIcon} from '../../MediaIcon';
import {Media} from '../../Media';
import {PageHelper} from '../../../../model/page.helper';
import {FileDTO} from '../../../../../../common/entities/FileDTO';
import {Utils} from '../../../../../../common/Utils';
import {Config} from '../../../../../../common/config/public/Config';
import {MapService} from '../map.service';
import {LatLng, Point} from 'leaflet';
import {MapComponent} from '@yaga/leaflet-ng2';

@Component({
  selector: 'app-gallery-map-lightbox',
  styleUrls: ['./lightbox.map.gallery.component.css'],
  templateUrl: './lightbox.map.gallery.component.html',
})
export class GalleryMapLightboxComponent implements OnChanges, AfterViewInit {


  @Input() photos: PhotoDTO[];
  @Input() gpxFiles: FileDTO[];
  public lightboxDimension: Dimension = {top: 0, left: 0, width: 0, height: 0} as Dimension;
  public mapDimension: Dimension = {top: 0, left: 0, width: 0, height: 0} as Dimension;
  public visible = false;
  public controllersVisible = false;
  public opacity = 1.0;
  mapPhotos: MapPhoto[] = [];
  paths: LatLng[][] = [];
  @ViewChild('root', {static: true}) elementRef: ElementRef;
  @ViewChild('yagaMap', {static: true}) yagaMap: MapComponent;
  public smallIconSize = new Point(Config.Client.Media.Thumbnail.iconSize * 0.75, Config.Client.Media.Thumbnail.iconSize * 0.75);
  public iconSize = new Point(Config.Client.Media.Thumbnail.iconSize, Config.Client.Media.Thumbnail.iconSize);
  private startPosition: Dimension = null;

  constructor(public fullScreenService: FullScreenService,
              private thumbnailService: ThumbnailManagerService,
              public mapService: MapService) {
  }


  ngOnChanges(): void {
    if (this.visible === false) {
      return;
    }
    this.showImages();

  }

  ngAfterViewInit(): void {
    // TODO: remove it once yaga/leaflet-ng2 is fixes.
    //  See issue: https://github.com/yagajs/leaflet-ng2/issues/440
    let i = 0;
    this.yagaMap.eachLayer((l): void => {
      if (i >= 3 || (this.paths.length === 0 && i >= 2)) {
        this.yagaMap.removeLayer(l);
      }
      ++i;
    });
  }

  @HostListener('window:resize', ['$event'])
  async onResize(): Promise<void> {
    this.lightboxDimension = ({
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    } as Dimension);
    this.mapDimension = ({
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    } as Dimension);
    await Utils.wait(0);
    this.yagaMap.invalidateSize();
  }


  public async show(position: Dimension): Promise<void> {
    this.hideImages();
    this.visible = true;
    this.opacity = 1.0;
    this.startPosition = position;
    this.lightboxDimension = position;
    this.lightboxDimension.top -= PageHelper.ScrollY;
    this.mapDimension = ({
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    } as Dimension);
    this.showImages();
    this.centerMap();
    PageHelper.hideScrollY();
    await Utils.wait(0);
    this.lightboxDimension = ({
      top: 0,
      left: 0,
      width: this.getScreenWidth(),
      height: this.getScreenHeight()
    } as Dimension);
    await Utils.wait(350);
    this.yagaMap.invalidateSize();
    this.centerMap();
    this.controllersVisible = true;
  }

  public hide(): void {
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
    setTimeout((): void => {
      this.visible = false;
      this.hideImages();
      this.yagaMap.zoom = 2;
    }, 500);
  }

  showImages(): void {
    this.hideImages();

    this.mapPhotos = this.photos.filter((p): number => {
      return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData
        && p.metadata.positionData.GPSData.latitude
        && p.metadata.positionData.GPSData.longitude;
    }).map((p): MapPhoto => {
      let width = 500;
      let height = 500;
      const size = p.metadata.size;
      if (size.width > size.height) {
        height = width * (size.height / size.width);
      } else {
        width = height * (size.width / size.height);
      }
      const iconTh = this.thumbnailService.getIcon(new MediaIcon(p));
      iconTh.Visible = true;
      const obj: MapPhoto = {
        name: p.name,
        lat: p.metadata.positionData.GPSData.latitude,
        lng: p.metadata.positionData.GPSData.longitude,
        iconThumbnail: iconTh,
        preview: {
          width,
          height,
          thumbnail: this.thumbnailService.getLazyThumbnail(new Media(p, width, height))
        }

      };
      if (Config.Client.Map.useImageMarkers === true) {
        if (iconTh.Available === true) {
          obj.iconUrl = iconTh.Src;
        } else {
          iconTh.OnLoad = (): void => {
            obj.iconUrl = iconTh.Src;
          };
        }
      }
      return obj;
    });
    if (this.gpxFiles) {
      this.loadGPXFiles().catch(console.error);
    }

  }

  public loadPreview(mp: MapPhoto): void {
    mp.preview.thumbnail.load();
    mp.preview.thumbnail.CurrentlyWaiting = true;
  }

  hideImages(): void {
    this.mapPhotos.forEach((mp): void => {
      mp.iconThumbnail.destroy();
      mp.preview.thumbnail.destroy();
    });
    this.mapPhotos = [];
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(e: KeyboardEvent): void {
    if (this.visible !== true) {
      return;
    }
    const event: KeyboardEvent = window.event ? window.event as any : e;
    switch (event.key) {
      case 'f':
      case 'F':
        if (this.fullScreenService.isFullScreenEnabled()) {
          this.fullScreenService.exitFullScreen();
        } else {
          this.fullScreenService.showFullScreen(this.elementRef.nativeElement);
        }
        break;
      case 'Escape': // escape
        this.hide();
        break;
    }
  }

  private centerMap(): void {
    if (this.mapPhotos.length > 0) {
      this.yagaMap.fitBounds(this.mapPhotos as any);
    }
  }

  private async loadGPXFiles(): Promise<void> {
    this.paths = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.gpxFiles.length; i++) {
      const file = this.gpxFiles[i];
      const path = await this.mapService.getMapPath(file);
      if (file !== this.gpxFiles[i]) { // check race condition
        return;
      }
      if (path.length === 0) {
        continue;
      }
      this.paths.push(path as LatLng[]);
    }
  }

  private getScreenWidth(): number {
    return window.innerWidth;
  }

  private getScreenHeight(): number {
    return window.innerHeight;
  }


}

export interface MapPhoto {
  name: string;
  lat: number;
  lng: number;
  iconUrl?: string;
  iconThumbnail: IconThumbnail;
  preview: {
    width: number;
    height: number;
    thumbnail: Thumbnail;
  };
}

