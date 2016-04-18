///<reference path="../../../browser.d.ts"/>

import {Component, Input,  ElementRef, OnChanges} from 'angular2/core';
import {Directory} from "../../../../common/entities/Directory";
import {Photo} from "../../../../common/entities/Photo";
import {GalleryPhotoComponent} from "../photo/photo.gallery.component";
import {GridRowBuilder} from "./GridRowBuilder";

@Component({
    selector: 'gallery-grid',
    templateUrl: 'app/gallery/grid/grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/grid.gallery.component.css'],
    directives:[GalleryPhotoComponent]
})
export class GalleryGridComponent implements OnChanges{
    
    @Input() directory:Directory;
    photosToRender:Array<GridPhoto> = [];
    private IMAGE_MARGIN = 2;
    private TARGET_COL_COUNT = 5;
    private MIN_ROW_COUNT = 2;
    private MAX_ROW_COUNT = 5;
    
    constructor(private elementRef: ElementRef) {
    }

    ngOnChanges(){
        this.renderPhotos();
    }
    
     private renderPhotos() {
         let maxRowHeight = window.innerHeight / this.MIN_ROW_COUNT;
         let minRowHeight = window.innerHeight / this.MAX_ROW_COUNT;

         this.photosToRender = [];
         let i = 0;

         while (i < this.directory.photos.length ) {

             let photoRowBuilder = new GridRowBuilder(this.directory.photos,i,this.IMAGE_MARGIN,this.getContainerWidth());
             photoRowBuilder.addPhotos(this.TARGET_COL_COUNT);
             photoRowBuilder.adjustRowHeightBetween(minRowHeight,maxRowHeight);

             let rowHeight = photoRowBuilder.calcRowHeight();
             let imageHeight = rowHeight - (this.IMAGE_MARGIN * 2);

             photoRowBuilder.getPhotoRow().forEach((photo) => {
                 let imageWidth = imageHeight * (photo.width / photo.height);
                 this.photosToRender.push(new GridPhoto(photo,imageWidth,imageHeight));
             });

             i+= photoRowBuilder.getPhotoRow().length;
         }
     }

    onResize() {
        this.renderPhotos();
    }
    
    private getContainerWidth(): number{
        if(typeof this.elementRef.nativeElement.firstElementChild === 'undefined' || 
            this.elementRef.nativeElement.firstElementChild  === null){
            return 0;
        }
        return this.elementRef.nativeElement.firstElementChild.clientWidth;
    }

 
}


class GridPhoto {
    constructor(public photo:Photo, public renderWidth:number, public renderHeight:number){

    }
}
