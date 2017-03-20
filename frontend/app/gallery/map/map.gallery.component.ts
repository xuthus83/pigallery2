import {Component, OnChanges, Input, ViewChild, ElementRef} from "@angular/core";
import {PhotoDTO} from "../../../../common/entities/PhotoDTO";
import {IRenderable, Dimension} from "../../model/IRenderable";
import {GalleryMapLightboxComponent} from "./lightbox/lightbox.map.gallery.component";
@Component({
    selector: 'gallery-map',
    templateUrl: 'app/gallery/map/map.gallery.component.html',
    styleUrls: ['app/gallery/map/map.gallery.component.css']
})
export class GalleryMapComponent implements OnChanges, IRenderable {

    @Input() photos: Array<PhotoDTO>;
    @ViewChild(GalleryMapLightboxComponent) mapLightbox: GalleryMapLightboxComponent;

    mapPhotos: Array<{latitude: number, longitude: number}> = [];
    mapCenter = {latitude: 0, longitude: 0};
    @ViewChild("map") map: ElementRef;

    //TODO: fix zooming
    ngOnChanges() {
        this.mapPhotos = this.photos.filter(p => {
            return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData;
        }).map(p => {
            return {
                latitude: p.metadata.positionData.GPSData.latitude,
                longitude: p.metadata.positionData.GPSData.longitude
            };
        });

        if (this.mapPhotos.length > 0) {
            this.mapCenter = this.mapPhotos[0];
        }


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

