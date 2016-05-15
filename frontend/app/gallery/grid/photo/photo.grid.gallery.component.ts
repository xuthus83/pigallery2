///<reference path="../../../../browser.d.ts"/>

import {Component, Input, ElementRef, ViewChild} from "@angular/core";
import {AnimationBuilder} from "@angular/platform-browser/src/animate/animation_builder";
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
    infoHeight:number = 0;
    infobackground = "";


    constructor(private animBuilder:AnimationBuilder) {
    }


    hover() {
        this.infoHeight = this.infoDiv.nativeElement.clientHeight;
        this.infobackground = "rgba(0,0,0,0.8)";
 
    }

    mouseOut() {
        this.infoHeight = 0;
        this.infobackground = "rgba(0,0,0,0.0)";

    }
    
    public getDimension():Dimension {
        return new Dimension(this.imageRef.nativeElement.offsetTop,
            this.imageRef.nativeElement.offsetLeft,
            this.imageRef.nativeElement.width,
            this.imageRef.nativeElement.height);
    }

}

