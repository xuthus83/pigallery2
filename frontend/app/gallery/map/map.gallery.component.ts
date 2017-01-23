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

    mapPhotos: Array<{latitude: string, longitude: string, iconUrl}> = [];
    mapCenter = {latitude: "0", longitude: "0"};

    //TODO: fix zooming
    ngOnChanges() {
        this.mapPhotos = this.photos.filter(p => {
            return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData;
        }).map(p => {
            return {
                latitude: p.metadata.positionData.GPSData.latitude,
                longitude: p.metadata.positionData.GPSData.longitude,
                iconUrl: Utils.concatUrls("/api/gallery/content/", p.directory.path, p.directory.name, p.name, "icon")
            };
        });

        if (this.mapPhotos.length > 0) {
            this.mapCenter = this.mapPhotos[0];
        }


    }
}

