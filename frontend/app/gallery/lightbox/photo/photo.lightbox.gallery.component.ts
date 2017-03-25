import {Component, Input, OnChanges} from "@angular/core";
import {GridPhoto} from "../../grid/GridPhoto";

@Component({
    selector: 'gallery-lightbox-photo',
    styleUrls: ['app/gallery/lightbox/photo/photo.lightbox.gallery.component.css'],
    templateUrl: 'app/gallery/lightbox/photo/photo.lightbox.gallery.component.html'
})
export class GalleryLightboxPhotoComponent implements OnChanges {

    @Input() gridPhoto: GridPhoto;

    public imageSize = {width: "auto", height: "100"};

    imageLoaded: boolean = false;

    constructor() {
    }

    ngOnChanges() {

        this.imageLoaded = false;
        this.setImageSize();
    }

    private setImageSize() {
        if (!this.gridPhoto) {
            return;
        }

        if (this.gridPhoto.photo.metadata.size.height > this.gridPhoto.photo.metadata.size.width) {
            this.imageSize.height = "100";
            this.imageSize.width = null;
        } else {
            this.imageSize.height = null;
            this.imageSize.width = "100";
        }
    }


    onImageLoad() {
        this.imageLoaded = true;
    }

    onImageError() {
        //TODO:handle error
        console.error("cant load image");
    }

    public showThumbnail(): boolean {
        return this.gridPhoto && !this.imageLoaded &&
            (this.gridPhoto.isThumbnailAvailable() || this.gridPhoto.isReplacementThumbnailAvailable());
    }

    public thumbnailPath(): string {
        if (this.gridPhoto.isThumbnailAvailable() === true)
            return this.gridPhoto.getThumbnailPath();

        if (this.gridPhoto.isReplacementThumbnailAvailable() === true)
            return this.gridPhoto.getReplacementThumbnailPath();
        return null
    }

}

