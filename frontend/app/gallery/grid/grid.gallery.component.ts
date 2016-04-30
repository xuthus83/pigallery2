///<reference path="../../../browser.d.ts"/>

import {
    Component, Input, ElementRef, OnChanges, ViewChild, ViewChildren, QueryList, Output, AfterViewInit, EventEmitter
} from 'angular2/core';
import {Directory} from "../../../../common/entities/Directory";
import {Photo} from "../../../../common/entities/Photo";
import {GalleryPhotoComponent} from "../photo/photo.gallery.component";
import {GridRowBuilder} from "./GridRowBuilder";
import {AnimationBuilder} from "angular2/animate";
import {Utils} from "../../../../common/Utils";
import {GalleryLightboxComponent} from "../lightbox/lightbox.gallery.component";
import {Observable} from "rxjs/Observable"; 
@Component({
    selector: 'gallery-grid',
    templateUrl: 'app/gallery/grid/grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/grid.gallery.component.css'],
    directives:[GalleryPhotoComponent]
})
export class GalleryGridComponent implements OnChanges,AfterViewInit{

    @ViewChild('gridContainer') gridContainer:ElementRef;
    @ViewChildren(GalleryPhotoComponent) gridPhotoQL:QueryList<GalleryPhotoComponent>; 
    
    @Input() directory:Directory;
    @Input() lightbox:GalleryLightboxComponent;
    
    photosToRender:Array<GridPhoto> = [];
    
    private IMAGE_MARGIN = 2;
    private TARGET_COL_COUNT = 5;
    private MIN_ROW_COUNT = 2;
    private MAX_ROW_COUNT = 5;
    
    constructor() {
    }

    ngOnChanges(){
        this.renderPhotos();
    }
    
    ngAfterViewInit(){ 
        this.lightbox.gridPhotoQL = this.gridPhotoQL;
        this.gridPhotoQL.changes.subscribe(
            (x)=> {
                if(this.renderedConteinerWidth != this.getContainerWidth()){
                    this.renderPhotos();
                }
            });
        
    }
   
    private renderedConteinerWidth = 0;
     private renderPhotos() {
         let maxRowHeight = window.innerHeight / this.MIN_ROW_COUNT;
         let minRowHeight = window.innerHeight / this.MAX_ROW_COUNT;
         let containerWidth = this.getContainerWidth();
         this.renderedConteinerWidth = containerWidth;

         this.photosToRender = [];
         let i = 0;

         while (i < this.directory.photos.length ) {

             let photoRowBuilder = new GridRowBuilder(this.directory.photos,i,this.IMAGE_MARGIN,containerWidth);
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
        if(!this.gridContainer){
            return 0;
        }
        return this.gridContainer.nativeElement.clientWidth;
    }

  


 
}


class GridPhoto {
    constructor(public photo:Photo, public renderWidth:number, public renderHeight:number){

    }
}
