import {Component, Input, ElementRef, ViewChild, OnInit, OnDestroy} from "@angular/core";
import {IRenderable, Dimension} from "../../../model/IRenderable";
import {GridPhoto} from "../GridPhoto";
import {SearchTypes} from "../../../../../common/entities/AutoCompleteItem";
import {RouterLink} from "@angular/router";
import {Config} from "../../../config/Config";
import {Thumbnail, ThumbnailManagerService} from "../../thumnailManager.service";

@Component({
    selector: 'gallery-grid-photo',
    templateUrl: 'app/gallery/grid/photo/photo.grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/photo/photo.grid.gallery.component.css'],
    providers: [RouterLink],
})
export class GalleryPhotoComponent implements IRenderable, OnInit,  OnDestroy {
    @Input() gridPhoto: GridPhoto;
    @ViewChild("img") imageRef: ElementRef;
    @ViewChild("info") infoDiv: ElementRef;
    @ViewChild("photoContainer") container: ElementRef;

    thumbnail: Thumbnail;
    /*
     image = {
     src: '',
     show: false
     };

     loading = {
     animate: false,
     show: true
     };
     */

    infoStyle = {
        height: 0,
        background: "rgba(0,0,0,0.0)"
    };

    SearchTypes: any = [];
    searchEnabled: boolean = true;

    wasInView: boolean = null;

    constructor(private thumbnailService: ThumbnailManagerService) {
        this.SearchTypes = SearchTypes;
        this.searchEnabled = Config.Client.Search.searchEnabled;
    }

    ngOnInit() {
        this.thumbnail = this.thumbnailService.getThumbnail(this.gridPhoto);
        /*  this.loading.show = true;
         //set up before adding task to thumbnail generator
         if (this.gridPhoto.isThumbnailAvailable()) {
         this.image.src = this.gridPhoto.getThumbnailPath();
         this.image.show = true;
         } else if (this.gridPhoto.isReplacementThumbnailAvailable()) {
         this.image.src = this.gridPhoto.getReplacementThumbnailPath();
         this.image.show = true;
         }*/

    }

    /*
     ngAfterViewInit() {
     //schedule change after Angular checks the model
     if (!this.gridPhoto.isThumbnailAvailable()) {
     setImmediate(() => {

     let listener: ThumbnailLoadingListener = {
     onStartedLoading: () => { //onLoadStarted
     this.loading.animate = true;
     },
     onLoad: () => {//onLoaded
     this.image.src = this.gridPhoto.getThumbnailPath();
     this.image.show = true;
     this.loading.show = false;
     this.thumbnailTask = null;
     },
     onError: (error) => {//onError
     this.thumbnailTask = null;
     //TODO: handle error
     //TODO: not an error if its from cache
     console.error("something bad happened");
     console.error(error);
     }
     };
     if (this.gridPhoto.isReplacementThumbnailAvailable()) {
     this.thumbnailTask = this.thumbnailService.loadImage(this.gridPhoto, ThumbnailLoadingPriority.medium, listener);
     } else {
     this.thumbnailTask = this.thumbnailService.loadImage(this.gridPhoto, ThumbnailLoadingPriority.high, listener);
     }


     });
     }
     }*/

    ngOnDestroy() {
        this.thumbnail.destroy();
        /*
         if (this.thumbnailTask != null) {
         this.thumbnailService.removeTask(this.thumbnailTask);
         this.thumbnailTask = null;
         }*/
    }


    isInView(): boolean {
        return document.body.scrollTop < this.container.nativeElement.offsetTop + this.container.nativeElement.clientHeight
            && document.body.scrollTop + window.innerHeight > this.container.nativeElement.offsetTop;
    }


    onScroll() {
        let isInView = this.isInView();
        if (this.wasInView != isInView) {
            this.wasInView = isInView;
            this.thumbnail.Visible = isInView;
        }
    }

    getPositionText(): string {
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

    /*
     onImageLoad() {
     this.loading.show = false;
     }
     */
    public getDimension(): Dimension {
        return <Dimension>{
            top: this.imageRef.nativeElement.offsetTop,
            left: this.imageRef.nativeElement.offsetLeft,
            width: this.imageRef.nativeElement.width,
            height: this.imageRef.nativeElement.height
        };
    }

}

