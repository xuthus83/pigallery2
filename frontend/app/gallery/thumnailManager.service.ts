import {Injectable} from "@angular/core";
import {ThumbnailLoaderService, ThumbnailLoadingListener, ThumbnailTaskEntity} from "./thumnailLoader.service";
import {Photo} from "./Photo";
import {IconPhoto} from "./IconPhoto";

export enum ThumbnailLoadingPriority{
  high, medium, low
}

@Injectable()
export class ThumbnailManagerService {


  constructor(private thumbnailLoader: ThumbnailLoaderService) {
  }

  public getThumbnail(photo: Photo): Thumbnail {
    return new Thumbnail(photo, this.thumbnailLoader);
  }


  public getIcon(photo: IconPhoto) {
    return new IconThumbnail(photo, this.thumbnailLoader);
  }
}


export abstract class ThumbnailBase {

  protected available: boolean = false;
  protected src: string = null;
  protected loading: boolean = false;
  protected onLoad: Function = null;
  protected thumbnailTask: ThumbnailTaskEntity;


  constructor(protected thumbnailService: ThumbnailLoaderService) {
  }

  abstract set Visible(visible: boolean);

  set OnLoad(onLoad: Function) {
    this.onLoad = onLoad;
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


export class IconThumbnail extends ThumbnailBase {

  constructor(private photo: IconPhoto, thumbnailService: ThumbnailLoaderService) {
    super(thumbnailService);
    this.src = "";
    if (this.photo.isIconAvailable()) {
      this.src = this.photo.getIconPath();
      this.available = true;
      if (this.onLoad) this.onLoad();
    }

    if (!this.photo.isIconAvailable()) {
      setTimeout(() => {

        let listener: ThumbnailLoadingListener = {
          onStartedLoading: () => { //onLoadStarted
            this.loading = true;
          },
          onLoad: () => {//onLoaded
            this.src = this.photo.getIconPath();
            if (this.onLoad) this.onLoad();
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
        this.thumbnailTask = this.thumbnailService.loadIcon(this.photo, ThumbnailLoadingPriority.high, listener);


      }, 0);
    }

  }

  set Visible(visible: boolean) {
    if (!this.thumbnailTask) return;
    if (visible === true) {
      this.thumbnailTask.priority = ThumbnailLoadingPriority.high;
    } else {
      this.thumbnailTask.priority = ThumbnailLoadingPriority.medium;
    }

  }


}

export class Thumbnail extends ThumbnailBase {


  constructor(private photo: Photo, thumbnailService: ThumbnailLoaderService) {
    super(thumbnailService);
    if (this.photo.isThumbnailAvailable()) {
      this.src = this.photo.getThumbnailPath();
      this.available = true;
      if (this.onLoad) this.onLoad();
    } else if (this.photo.isReplacementThumbnailAvailable()) {
      this.src = this.photo.getReplacementThumbnailPath();
      this.available = true;
    }

    if (!this.photo.isThumbnailAvailable()) {
      setTimeout(() => {

        let listener: ThumbnailLoadingListener = {
          onStartedLoading: () => { //onLoadStarted
            this.loading = true;
          },
          onLoad: () => {//onLoaded
            this.src = this.photo.getThumbnailPath();
            if (this.onLoad) this.onLoad();
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


      }, 0);
    }

  }

  set Visible(visible: boolean) {
    if (!this.thumbnailTask) return;
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

}

