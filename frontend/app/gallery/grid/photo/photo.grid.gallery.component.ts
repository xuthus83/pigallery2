///<reference path="../../../../browser.d.ts"/>

import {Component, Input, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy, Renderer} from "@angular/core";
import {IRenderable, Dimension} from "../../../model/IRenderable";
import {GridPhoto} from "../GridPhoto";
import {SearchTypes} from "../../../../../common/entities/AutoCompleteItem";
import {RouterLink} from "@angular/router-deprecated";
import {Config} from "../../../config/Config";
import {
    ThumbnailLoaderService,
    ThumbnailTaskEntity,
    ThumbnailLoadingListener,
    ThumbnailLoadingPriority
} from "../thumnailLoader.service";
import {GalleryPhotoLoadingComponent} from "./loading/loading.photo.grid.gallery.component";

@Component({
    selector: 'gallery-grid-photo',
    templateUrl: 'app/gallery/grid/photo/photo.grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/photo/photo.grid.gallery.component.css'],
    directives: [RouterLink, GalleryPhotoLoadingComponent],
})
export class GalleryPhotoComponent implements IRenderable, OnInit, AfterViewInit, OnDestroy {
    @Input() gridPhoto:GridPhoto;
    @ViewChild("img") imageRef:ElementRef;
    @ViewChild("info") infoDiv:ElementRef;
    @ViewChild("photoContainer") container:ElementRef;


    image = {
        src: '',
        show: false
    };

    loading = {
        animate: false,
        show: true
    };

    thumbnailTask:ThumbnailTaskEntity = null;

    infoStyle = {
        height: 0,
        background: "rgba(0,0,0,0.0)"
    };

    SearchTypes:any = [];
    searchEnabled:boolean = true;

    wasInView:boolean = null;

    constructor(private thumbnailService:ThumbnailLoaderService, private renderer:Renderer) {
        this.SearchTypes = SearchTypes;
        this.searchEnabled = Config.Client.Search.searchEnabled;


    }

    ngOnInit() {
        //set up befoar adding task to thumbnail generator
        if (this.gridPhoto.isThumbnailAvailable()) {
            this.image.src = this.gridPhoto.getThumbnailPath();
            this.image.show = true;
            //  this.loading.show = false;

        } else {
            if (this.gridPhoto.isReplacementThumbnailAvailable()) {
                this.image.src = this.gridPhoto.getReplacementThumbnailPath();
                this.image.show = true;
                this.loading.show = false;
            } else {
                this.loading.show = true;
            }
        }
    }

    ngAfterViewInit() {
        //schedule change after Angular checks the model
        if (!this.gridPhoto.isThumbnailAvailable()) {
            setImmediate(() => {

                let listener:ThumbnailLoadingListener = {
                    onStartedLoading: ()=> { //onLoadStarted
                        this.loading.animate = true;
                    },
                    onLoad: ()=> {//onLoaded
                        this.image.src = this.gridPhoto.getThumbnailPath();
                        this.image.show = true;
                        this.loading.show = false;
                        this.thumbnailTask = null;
                    },
                    onError: (error)=> {//onError
                        this.thumbnailTask = null;
                        //TODO: handle error
                        console.error("something bad happened");
                        console.error(error);
                    }
                };
                /*  this.scrollListener = this.renderer.listenGlobal('window', 'scroll', () => {
                 this.onScroll();
                 });*/
                if (this.gridPhoto.isReplacementThumbnailAvailable()) {
                    this.thumbnailTask = this.thumbnailService.loadImage(this.gridPhoto, ThumbnailLoadingPriority.medium, listener);
                } else {
                    this.thumbnailTask = this.thumbnailService.loadImage(this.gridPhoto, ThumbnailLoadingPriority.high, listener);
                }


            });
        }
    }

    ngOnDestroy() {
        if (this.thumbnailTask != null) {
            this.thumbnailService.removeTask(this.thumbnailTask);
            this.thumbnailTask = null;
        }
    }


    isInView():boolean {
        return document.body.scrollTop < this.container.nativeElement.offsetTop + this.container.nativeElement.clientHeight
            && document.body.scrollTop + window.innerHeight > this.container.nativeElement.offsetTop;
    }


    onScroll() {
        if (this.thumbnailTask != null) {
            let isInView = this.isInView();
            if (this.wasInView != isInView) {
                this.wasInView = isInView;
                if (isInView == true) {
                    if (this.gridPhoto.isReplacementThumbnailAvailable()) {
                        this.thumbnailTask.priority = ThumbnailLoadingPriority.medium;
                    } else {
                        this.thumbnailTask.priority = ThumbnailLoadingPriority.high;
                    }
                } else {
                    if (this.gridPhoto.isReplacementThumbnailAvailable()) {
                        this.thumbnailTask.priority = ThumbnailLoadingPriority.low;
                    } else {
                        this.thumbnailTask.priority = ThumbnailLoadingPriority.medium;
                    }
                }
            }
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

    onImageLoad() {
        this.loading.show = false;
    }

    public getDimension():Dimension {
        return new Dimension(this.imageRef.nativeElement.offsetTop,
            this.imageRef.nativeElement.offsetLeft,
            this.imageRef.nativeElement.width,
            this.imageRef.nativeElement.height);
    }

}

