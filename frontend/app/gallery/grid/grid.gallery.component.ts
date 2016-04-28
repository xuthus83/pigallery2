///<reference path="../../../browser.d.ts"/>

import {
    Component, Input, ElementRef, OnChanges, ViewChild, ViewChildren, QueryList
} from 'angular2/core';
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
    @ViewChildren(GalleryPhotoComponent) photosRef:QueryList<GalleryPhotoComponent>;
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
    private activePhoto:GalleryPhotoComponent  = null;
    public showLightBox(gridPhoto:GridPhoto){
        let galleryPhotoComponents = this.photosRef.toArray();
        let selectedPhoto:GalleryPhotoComponent = null;
        for(let i= 0; i < galleryPhotoComponents.length; i++){
            if(galleryPhotoComponents[i].photo == gridPhoto.photo){
                selectedPhoto = galleryPhotoComponents[i];
                break;
            }
        }
        if(selectedPhoto === null){
            throw new Error("Can't find Photo");
        }
        this.activePhoto = selectedPhoto;        
  
        this.lightboxModel.image.src = Photo.getThumbnailPath(this.directory,gridPhoto.photo);

        let from = {"top":selectedPhoto.elementRef.nativeElement.firstChild.offsetTop+"px",
                    "left":selectedPhoto.elementRef.nativeElement.firstChild.offsetLeft+"px",
                    width:gridPhoto.renderWidth+"px",
                    height: gridPhoto.renderHeight+"px"};
        
        let animation0 = this.animBuilder.css();
        animation0.setDuration(0);
        animation0.setToStyles(from);
        animation0.start(this.lightBoxDiv.nativeElement).onComplete(()=>{
            
            let animation = this.animBuilder.css();
            animation.setDuration(1000); 
            animation.setFromStyles(from);
            animation.setToStyles({height: "100%", width: "100%", "top":"0px","left": "0px"});
            animation.start(this.lightBoxDiv.nativeElement);
        });
    }

    public hideLightBox() {
        let to = {"top":this.activePhoto.elementRef.nativeElement.firstChild.offsetTop+"px",
            "left":this.activePhoto.elementRef.nativeElement.firstChild.offsetLeft+"px",
            width:this.activePhoto.elementRef.nativeElement.firstChild.width+"px",
            height: this.activePhoto.elementRef.nativeElement.firstChild.height+"px"};

        let animation = this.animBuilder.css();
        animation.setDuration(1000);
        animation.setFromStyles({height: "100%", width: "100%", "top":"0px","left": "0px"});
        animation.setToStyles(to);
        animation.start(this.lightBoxDiv.nativeElement).onComplete(()=>{
            let animation2 = this.animBuilder.css();
            animation2.setDuration(0);
            animation2.setToStyles({height: "0px", width: "0px", "top":"0px","left": "0px"});
            animation2.start(this.lightBoxDiv.nativeElement);
        });
    }

 
}


class GridPhoto {
    constructor(public photo:Photo, public renderWidth:number, public renderHeight:number){

    }
}
