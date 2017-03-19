import {Injectable} from "@angular/core";
import {Photo} from "../Photo";
import {ThumbnailLoaderService, ThumbnailLoadingListener, ThumbnailTaskEntity} from "./thumnailLoader.service";

export enum ThumbnailLoadingPriority{
    high, medium, low
}

@Injectable()
export class ThumbnailManagerService {


    constructor(private thumbnailLoader: ThumbnailLoaderService) {
    }

    public getThumbnail(photo: Photo) {
        return new Thumbnail(photo, this.thumbnailLoader);
    }
}


export class Thumbnail {

    private available: boolean = false;
    private src: string = null;
    private loading: boolean = false;
    private thumbnailTask: ThumbnailTaskEntity;


    constructor(private photo: Photo, private thumbnailService: ThumbnailLoaderService) {
        if (this.photo.isThumbnailAvailable()) {
            this.src = this.photo.getThumbnailPath();
            this.available = true;
        } else if (this.photo.isReplacementThumbnailAvailable()) {
            this.src = this.photo.getReplacementThumbnailPath();
            this.available = true;
        }

        if (!this.photo.isThumbnailAvailable()) {
            setImmediate(() => {

                let listener: ThumbnailLoadingListener = {
                    onStartedLoading: () => { //onLoadStarted
                        this.loading = true;
                    },
                    onLoad: () => {//onLoaded
                        this.src = this.photo.getThumbnailPath();
                        this.available = true;
                        this.loading = false;
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
                if (this.photo.isReplacementThumbnailAvailable()) {
                    this.thumbnailTask = this.thumbnailService.loadImage(this.photo, ThumbnailLoadingPriority.medium, listener);
                } else {
                    this.thumbnailTask = this.thumbnailService.loadImage(this.photo, ThumbnailLoadingPriority.high, listener);
                }


            });
        }

    }

    set Visible(visible: boolean) {
        if (visible === true) {
            if (this.photo.isReplacementThumbnailAvailable()) {
                this.thumbnailTask.priority = ThumbnailLoadingPriority.medium;
            } else {
                this.thumbnailTask.priority = ThumbnailLoadingPriority.high;
            }
        } else {
            if (this.photo.isReplacementThumbnailAvailable()) {
                this.thumbnailTask.priority = ThumbnailLoadingPriority.low;
            } else {
                this.thumbnailTask.priority = ThumbnailLoadingPriority.medium;
            }
        }

    }


    get Available() {
        return this.available;
    }

    get Src() {
        return this.src;
    }

    get Loading() {
        return this.loading;
    }

    destroy() {
        if (this.thumbnailTask != null) {
            this.thumbnailService.removeTask(this.thumbnailTask);
            this.thumbnailTask = null;
        }
    }
}

