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
    @ViewChild("info") infoDiv:ElementRef;

    infoStyle = {
        height: 0,
        background: ""
    };

    constructor() {
    }


    hover() {
        this.infoStyle.height = this.infoDiv.nativeElement.clientHeight;
        this.infoStyle.background = "rgba(0,0,0,0.8)";
 
    }

    mouseOut() {
        this.infoStyle.height = 0;
        this.infoStyle.background = "rgba(0,0,0,0.0)";

    }
    
    public getDimension():Dimension {
        return new Dimension(this.imageRef.nativeElement.offsetTop,
            this.imageRef.nativeElement.offsetLeft,
            this.imageRef.nativeElement.width,
            this.imageRef.nativeElement.height);
    }

}

