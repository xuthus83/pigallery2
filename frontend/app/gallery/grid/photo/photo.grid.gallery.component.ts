///<reference path="../../../../browser.d.ts"/>

import {Component, Input, ElementRef, ViewChild} from "@angular/core";
import {IRenderable, Dimension} from "../../../model/IRenderable";
import {GridPhoto} from "../GridPhoto";

@Component({
    selector: 'gallery-grid-photo',
    templateUrl: 'app/gallery/grid/photo/photo.grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/photo/photo.grid.gallery.component.css'],
})
export class GalleryPhotoComponent implements IRenderable {
    @Input() gridPhoto:GridPhoto;
    @ViewChild("image") imageRef:ElementRef;

    constructor() {
    }

    /* getPhotoPath() {

     let renderSize = Math.sqrt(this.gridPhoto.renderWidth * this.gridPhoto.renderHeight);
     let size = Utils.findClosest(renderSize, Config.Client.thumbnailSizes);
     return Utils.concatUrls("/api/gallery/content/", this.gridPhoto.photo.directory.path, this.gridPhoto.photo.directory.name, this.gridPhoto.photo.name, "thumbnail", size.toString());
    }
     */

    public getDimension():Dimension {
        return new Dimension(this.imageRef.nativeElement.offsetTop,
            this.imageRef.nativeElement.offsetLeft,
            this.imageRef.nativeElement.width,
            this.imageRef.nativeElement.height);
    }

}

