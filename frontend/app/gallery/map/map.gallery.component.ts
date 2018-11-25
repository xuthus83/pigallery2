import {Component, ElementRef, Input, OnChanges, ViewChild, AfterViewInit} from '@angular/core';
import {PhotoDTO} from '../../../../common/entities/PhotoDTO';
import {Dimension, IRenderable} from '../../model/IRenderable';
import {GalleryMapLightboxComponent} from './lightbox/lightbox.map.gallery.component';
import {ThumbnailManagerService} from '../thumnailManager.service';
import {FullScreenService} from '../fullscreen.service';
import {LatLngBounds, MapsAPILoader, AgmMap} from '@agm/core';
import {FileDTO} from '../../../../common/entities/FileDTO';

@Component({
  selector: 'app-gallery-map',
  templateUrl: './map.gallery.component.html',
  styleUrls: ['./map.gallery.component.css']
})
export class GalleryMapComponent implements OnChanges, IRenderable, AfterViewInit {

  @Input() photos: PhotoDTO[];
  @Input() metaFiles: FileDTO[];
  @ViewChild(GalleryMapLightboxComponent) mapLightbox: GalleryMapLightboxComponent;

  mapPhotos: Array<{ latitude: number, longitude: number }> = [];
  @ViewChild('map') mapElement: ElementRef;
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


  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.height = this.mapElement.nativeElement.clientHeight;
    }, 0);
  }


  click() {
    this.mapLightbox.show(this.getDimension());
  }

  public getDimension(): Dimension {
    return <Dimension>{
      top: this.mapElement.nativeElement.offsetTop,
      left: this.mapElement.nativeElement.offsetLeft,
      width: this.mapElement.nativeElement.offsetWidth,
      height: this.mapElement.nativeElement.offsetHeight
    };
  }
}

