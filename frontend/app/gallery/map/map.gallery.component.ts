import {Component, OnChanges, Input} from "@angular/core";
import {PhotoDTO} from "../../../../common/entities/PhotoDTO";
import {Utils} from "../../../../common/Utils";
@Component({
    selector: 'gallery-map',
    templateUrl: 'app/gallery/map/map.gallery.component.html',
    styleUrls: ['app/gallery/map/map.gallery.component.css']
})
export class GalleryMapComponent implements OnChanges {

    @Input() photos: Array<PhotoDTO>;

    mapPhotos: Array<{latitude, longitude, iconUrl}> = [];


    //TODO: fix zooming
    ngOnChanges() {
        this.mapPhotos = this.photos.filter(p => p.metadata.positionData.GPSData).map(p => {
            return {
                latitude: p.metadata.positionData.GPSData.latitude,
                longitude: p.metadata.positionData.GPSData.longitude,
                iconUrl: Utils.concatUrls("/api/gallery/content/", p.directory.path, p.directory.name, p.name, "icon")
            };
        });


    }
}

