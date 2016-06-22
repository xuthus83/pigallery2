///<reference path="../../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {GridPhoto} from "./GridPhoto";
import {Config} from "../../config/Config";

@Injectable()
export class ThumbnailLoaderService {

    que:Array<ThumbnailTask> = [];
    runningRequests:number = 0;

    constructor() {
    }

    loadImage(gridPhoto:GridPhoto, onStartedLoading, onLoad, onError):void { 
        let tmp:ThumbnailTask = null;
        for (let i = 0; i < this.que.length; i++) {
            if (this.que[i].gridPhoto.getThumbnailPath() == gridPhoto.getThumbnailPath()) {
                tmp = this.que[i];
                break;
            }
        }
        if (tmp != null) {
            tmp.onStartedLoading.push(onStartedLoading);
            tmp.onLoad.push(onLoad);
            tmp.onError.push(onError);
        } else {
            this.que.push({
                gridPhoto: gridPhoto,
                onStartedLoading: [onStartedLoading],
                onLoad: [onLoad],
                onError: [onError]
            });
        }
        this.run();

    }


    run() {
        if (this.que.length === 0 || this.runningRequests >= Config.Client.concurrentThumbnailGenerations) {
            return;
        }
        this.runningRequests++;
        let task = this.que.shift();
        task.onStartedLoading.forEach(cb=>cb()); 

        let curImg = new Image();
        curImg.src = task.gridPhoto.getThumbnailPath();
        curImg.onload = () => { 
            task.gridPhoto.thumbnailLoaded();
            task.onLoad.forEach(cb=>cb());
            this.runningRequests--;
            this.run();
        };

        curImg.onerror = (error) => { 
            task.onLoad.forEach(cb=>cb(error));
            this.runningRequests--;
            this.run();
        };
    }

}

interface ThumbnailTask {
    gridPhoto:GridPhoto;
    onStartedLoading:Array<Function>;
    onLoad:Array<Function>;
    onError:Array<Function>;
}
