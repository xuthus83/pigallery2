///<reference path="../../../../browser.d.ts"/>

import {Component, Input, ElementRef, ViewChild, OnChanges} from "@angular/core";
import {IRenderable, Dimension} from "../../../model/IRenderable";
import {GridPhoto} from "../GridPhoto";
import {SearchTypes} from "../../../../../common/entities/AutoCompleteItem";
import {RouterLink} from "@angular/router-deprecated";
import {Config} from "../../../config/Config";
import {ThumbnailLoaderService} from "../thumnailLoader.service";

@Component({
    selector: 'gallery-grid-photo',
    templateUrl: 'app/gallery/grid/photo/photo.grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/photo/photo.grid.gallery.component.css'],
    directives: [RouterLink],
})
export class GalleryPhotoComponent implements IRenderable, OnChanges {
    @Input() gridPhoto:GridPhoto;
    @ViewChild("image") imageRef:ElementRef;
    @ViewChild("info") infoDiv:ElementRef;

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

    ngOnChanges() {
        if (this.gridPhoto.isThumbnailAvailable()) {
            this.imageSrc = this.gridPhoto.getThumbnailPath();
            //    this.showImage = true;
        } else {
            this.thumbnailService.loadImage(this.gridPhoto).then(()=> {
                this.imageSrc = this.gridPhoto.getThumbnailPath();
                //    this.showImage = true;
                this.gridPhoto.thumbnailLoaded();
            }).catch((error)=> {
                console.error("something bad happened");
            });
        }
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

