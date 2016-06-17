///<reference path="../../../../browser.d.ts"/>

import {Component, Input, ElementRef, ViewChild, AfterViewInit} from "@angular/core";
import {IRenderable, Dimension} from "../../../model/IRenderable";
import {GridPhoto} from "../GridPhoto";
import {SearchTypes} from "../../../../../common/entities/AutoCompleteItem";
import {RouterLink} from "@angular/router-deprecated";
import {Config} from "../../../config/Config";
import {ThumbnailLoaderService} from "../thumnailLoader.service";
import {GalleryPhotoLoadingComponent} from "./loading/loading.photo.grid.gallery.component";

@Component({
    selector: 'gallery-grid-photo',
    templateUrl: 'app/gallery/grid/photo/photo.grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/photo/photo.grid.gallery.component.css'],
    directives: [RouterLink, GalleryPhotoLoadingComponent],
})
export class GalleryPhotoComponent implements IRenderable, AfterViewInit {
    @Input() gridPhoto:GridPhoto;
    @ViewChild("image") imageRef:ElementRef;
    @ViewChild("info") infoDiv:ElementRef;
    @ViewChild(GalleryPhotoLoadingComponent) loading:GalleryPhotoLoadingComponent;

    imageSrc = "#";
    showImage = false;
    infoStyle = {
        height: 0,
        background: ""
    };

    SearchTypes:any = [];
    searchEnabled:boolean = true;

    constructor(private thumbnailService:ThumbnailLoaderService) {
        this.SearchTypes = SearchTypes;
        this.searchEnabled = Config.Client.Search.searchEnabled;
    }

    ngAfterViewInit() {
        //schedule change after Angular checks the model
        setImmediate(() => {
            if (this.gridPhoto.isThumbnailAvailable()) {
                this.imageSrc = this.gridPhoto.getThumbnailPath();
                this.showImage = true;
            } else {
                this.thumbnailService.loadImage(this.gridPhoto,
                    ()=> { //onLoadStarted
                        this.loading.startAnimation();
                    },
                    ()=> {//onLoaded
                        this.imageSrc = this.gridPhoto.getThumbnailPath();
                        this.showImage = true;
                    },
                    ()=> {//onError
                        console.error("something bad happened");
                    });
            }
        });
    }


    getPositionText():string {
        if (!this.gridPhoto) {
            return ""
        }
        return this.gridPhoto.photo.metadata.positionData.city ||
            this.gridPhoto.photo.metadata.positionData.state ||
            this.gridPhoto.photo.metadata.positionData.country;
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

