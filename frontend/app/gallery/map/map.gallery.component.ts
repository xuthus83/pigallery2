import {Component, ElementRef, Input, OnChanges, ViewChild, AfterViewInit} from '@angular/core';
import {PhotoDTO} from '../../../../common/entities/PhotoDTO';
import {Dimension, IRenderable} from '../../model/IRenderable';
import {GalleryMapLightboxComponent} from './lightbox/lightbox.map.gallery.component';
import {ThumbnailManagerService} from '../thumnailManager.service';
import {FullScreenService} from '../fullscreen.service';
import {LatLngBounds, MapsAPILoader} from '@agm/core';

@Component({
  selector: 'app-gallery-map',
  templateUrl: './map.gallery.component.html',
  styleUrls: ['./map.gallery.component.css']
})
export class GalleryMapComponent implements OnChanges, IRenderable, AfterViewInit {

  @Input() photos: Array<PhotoDTO>;
  @ViewChild(GalleryMapLightboxComponent) mapLightbox: GalleryMapLightboxComponent;

  mapPhotos: Array<{ latitude: number, longitude: number }> = [];
  public latlngBounds: LatLngBounds;
  @ViewChild('map') map: ElementRef;
  height = null;


  constructor(private mapsAPILoader: MapsAPILoader) {
  }

  ngOnChanges() {
    this.mapPhotos = this.photos.filter(p => {
      return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData &&
        p.metadata.positionData.GPSData.latitude && p.metadata.positionData.GPSData.longitude;
    }).map(p => {
      return {
        latitude: p.metadata.positionData.GPSData.latitude,
        longitude: p.metadata.positionData.GPSData.longitude
      };
    });


    this.findPhotosBounds().catch(console.error);

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.height = this.map.nativeElement.clientHeight;
      console.log(this.height);
    }, 0);
  }

  private async findPhotosBounds() {
    await this.mapsAPILoader.load();
    if (!window['google']) {
      return;
    }
    this.latlngBounds = new window['google'].maps.LatLngBounds();

    for (const photo of this.mapPhotos) {
      this.latlngBounds.extend(new window['google'].maps.LatLng(photo.latitude, photo.longitude));
    }
    const clat = this.latlngBounds.getCenter().lat();
    const clng = this.latlngBounds.getCenter().lng();
    this.latlngBounds.extend(new window['google'].maps.LatLng(clat + 0.5, clng + 0.5));
    this.latlngBounds.extend(new window['google'].maps.LatLng(clat - 0.5, clng - 0.5));

  }

  click() {
    this.mapLightbox.show(this.getDimension());
  }

  public getDimension(): Dimension {
    return <Dimension>{
      top: this.map.nativeElement.offsetTop,
      left: this.map.nativeElement.offsetLeft,
      width: this.map.nativeElement.offsetWidth,
      height: this.map.nativeElement.offsetHeight
    };
  }
}

