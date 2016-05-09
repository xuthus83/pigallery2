///<reference path="../../../browser.d.ts"/>

import {
    Component,
    Input,
    ElementRef,
    OnChanges,
    ViewChild,
    ViewChildren,
    QueryList,
    AfterViewInit
} from "@angular/core";
import {Photo} from "../../../../common/entities/Photo";
import {GalleryPhotoComponent} from "../photo/photo.gallery.component";
import {GridRowBuilder} from "./GridRowBuilder";
import {GalleryLightboxComponent} from "../lightbox/lightbox.gallery.component";

@Component({
    selector: 'gallery-grid',
    templateUrl: 'app/gallery/grid/grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/grid.gallery.component.css'],
    directives: [GalleryPhotoComponent]
})
export class GalleryGridComponent implements OnChanges,AfterViewInit {

    @ViewChild('gridContainer') gridContainer:ElementRef;
    @ViewChildren(GalleryPhotoComponent) gridPhotoQL:QueryList<GalleryPhotoComponent>;

    @Input() photos:Array<Photo>;
    @Input() lightbox:GalleryLightboxComponent;

    photosToRender:Array<GridPhoto> = [];

    private IMAGE_MARGIN = 2;
    private TARGET_COL_COUNT = 5;
    private MIN_ROW_COUNT = 2;
    private MAX_ROW_COUNT = 5;

    constructor() {
    }

    ngOnChanges() {
        this.renderPhotos();
    }

    onResize() {
        this.renderPhotos();
    }

    ngAfterViewInit() {
        this.lightbox.gridPhotoQL = this.gridPhotoQL;
        /*   this.gridPhotoQL.changes.subscribe(
         (x)=> {
         console.log("changed");
         if (!this.directory || this.gridPhotoQL.length < this.directory.photos.length) {
         console.log("bad");
         console.log(this.directory ? this.gridPhotoQL.length + " < "+this.directory.photos.length : "no dir");
         return;
         }
         if (this.renderedContainerWidth != this.getContainerWidth()) {
         this.renderPhotos();
         }
         },
         (err) => {
         console.log('Error: %s', err);
         },
         () =>{
         console.log('Completed');
         }

         ); */


        setImmediate(() => {
            this.renderPhotos();
        });
    }


    private renderedContainerWidth = 0;

    private renderPhotos() {
        if (this.getContainerWidth() == 0) {
            return;
        }
        let maxRowHeight = window.innerHeight / this.MIN_ROW_COUNT;
        let minRowHeight = window.innerHeight / this.MAX_ROW_COUNT;
        let containerWidth = this.getContainerWidth();
        this.renderedContainerWidth = containerWidth;

        this.photosToRender = [];
        let i = 0;

        while (i < this.photos.length) {

            let photoRowBuilder = new GridRowBuilder(this.photos, i, this.IMAGE_MARGIN, containerWidth);
            photoRowBuilder.addPhotos(this.TARGET_COL_COUNT);
            photoRowBuilder.adjustRowHeightBetween(minRowHeight, maxRowHeight);

            let rowHeight = photoRowBuilder.calcRowHeight();
            let imageHeight = rowHeight - (this.IMAGE_MARGIN * 2);

            photoRowBuilder.getPhotoRow().forEach((photo) => {
                let imageWidth = imageHeight * (photo.width / photo.height);
                this.photosToRender.push(new GridPhoto(photo, imageWidth, imageHeight));
            });

            i += photoRowBuilder.getPhotoRow().length;
        }
    }


    private getContainerWidth():number {
        if (!this.gridContainer) {
            return 0;
        }
        return this.gridContainer.nativeElement.clientWidth;
    }


}


class GridPhoto {
    constructor(public photo:Photo, public renderWidth:number, public renderHeight:number) {

    }
}
