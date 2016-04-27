///<reference path="../../../browser.d.ts"/>

import {Component, Input, ElementRef, OnChanges, ViewChild, ContentChild} from 'angular2/core';
import {Directory} from "../../../../common/entities/Directory";
import {Photo} from "../../../../common/entities/Photo";
import {GalleryPhotoComponent} from "../photo/photo.gallery.component";
import {GridRowBuilder} from "./GridRowBuilder";
import {AnimationBuilder} from "angular2/animate";
import {Utils} from "../../../../common/Utils";

@Component({
    selector: 'gallery-grid',
    templateUrl: 'app/gallery/grid/grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/grid.gallery.component.css'],
    directives:[GalleryPhotoComponent]
})
export class GalleryGridComponent implements OnChanges{

    @ViewChild('lightbox') lightBoxDiv:ElementRef;
    @ViewChild('gridContainer') gridContainer:ElementRef;
    @Input() directory:Directory;
    photosToRender:Array<GridPhoto> = [];
    private IMAGE_MARGIN = 2;
    private TARGET_COL_COUNT = 5;
    private MIN_ROW_COUNT = 2;
    private MAX_ROW_COUNT = 5;
    
    constructor(private elementRef: ElementRef,private animBuilder: AnimationBuilder) {
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
        return this.gridContainer.nativeElement.clientWidth;
    }

    public lightboxModel = {top:0,left:0, image:{width:0, height:0,src:""}, visible: false};
    
    public showLightBox(event,gridPhoto:GridPhoto){
        gridPhoto = Utils.clone(gridPhoto);
 
        this.lightboxModel.visible = true;

        this.lightboxModel.image.src = Photo.getThumbnailPath(this.directory,gridPhoto.photo);
        console.log( this.gridContainer);

        let animation0 = this.animBuilder.css();
        animation0.setDuration(0);
        animation0.setToStyles({height: gridPhoto.renderHeight+"px", width:gridPhoto.renderWidth+"px",
            "top":event.target.offsetTop+"px", "left":event.target.offsetLeft+"px"});
        animation0.start(this.lightBoxDiv.nativeElement).onComplete(()=>{
            
            let animation = this.animBuilder.css();
            animation.setDuration(1000); 
            animation.setFromStyles({height: gridPhoto.renderHeight+"px", width:gridPhoto.renderWidth+"px",
                                    "top":event.target.offsetTop+"px", "left":event.target.offsetLeft+"px"});
            animation.setToStyles({height: "100%", width: "100%",
                                    "top":"0px","left": "0px"});
            animation.start(this.lightBoxDiv.nativeElement);
        });
    }

    public hideLightBox(event) {
        this.lightBoxDiv.nativeElement.style.width = 0;

        this.lightBoxDiv.nativeElement.style.height = 0;
    }

 
}


class GridPhoto {
    constructor(public photo:Photo, public renderWidth:number, public renderHeight:number){

    }
}
