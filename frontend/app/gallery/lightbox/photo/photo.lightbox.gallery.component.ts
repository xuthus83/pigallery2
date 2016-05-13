///<reference path="../../../../browser.d.ts"/>

import {Component, OnChanges, Input, ViewChild, ElementRef} from "@angular/core";
import {GridPhoto} from "../../grid/GridPhoto";

@Component({
    selector: 'gallery-lightbox-photo',
    styleUrls: ['app/gallery/lightbox/photo/photo.lightbox.gallery.component.css'],
    templateUrl: 'app/gallery/lightbox/photo/photo.lightbox.gallery.component.html'
})
export class GalleryLightboxPhotoComponent implements OnChanges {

    @Input() gridPhoto:GridPhoto;

    public imageSize = {width: "auto", height: "100"};
    @ViewChild('imgContainer') nativeElement:ElementRef;


    constructor() {
    }

    ngOnChanges() {
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

}

