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

    removeTasks() {
        this.que = [];
    }

    loadImage(gridPhoto:GridPhoto, onStartedLoading:()=>void, onLoad:()=>void, onError:(error)=>void):void {
        let tmp:ThumbnailTask = null;
        //is image already qued?
        for (let i = 0; i < this.que.length; i++) {
            if (this.que[i].gridPhoto.getThumbnailPath() == gridPhoto.getThumbnailPath()) {
                tmp = this.que[i];
                break;
            }
        }
        //add to previous
        if (tmp != null) {
            tmp.onStartedLoading.push(onStartedLoading);
            tmp.onLoad.push(onLoad);
            tmp.onError.push(onError);
            if (tmp.inProgress == true) {
                onStartedLoading();
            }


        } else {//create new task
            this.que.push({
                gridPhoto: gridPhoto,
                inProgress: false,
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
        let task = this.que[0];
        task.onStartedLoading.forEach(cb=>cb());
        task.inProgress = true;
        
        let curImg = new Image();
        curImg.src = task.gridPhoto.getThumbnailPath();
        
        curImg.onload = () => {
            
            task.gridPhoto.thumbnailLoaded();
            task.onLoad.forEach(cb=>cb());

            this.que.shift();
            this.runningRequests--;
            this.run();
        };

        curImg.onerror = (error) => {
            
            task.onLoad.forEach(cb=>cb(error));

            this.que.shift();
            this.runningRequests--;
            this.run();
        };
    }

}

interface ThumbnailTask {
    gridPhoto:GridPhoto;
    inProgress:boolean;
    onStartedLoading:Array<Function>;
    onLoad:Array<Function>;
    onError:Array<Function>;
}
