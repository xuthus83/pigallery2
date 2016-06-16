///<reference path="../../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {GridPhoto} from "./GridPhoto";

@Injectable()
export class ThumbnailLoaderService {

    que:Array<ThumbnailTask> = [];

    constructor() {
    }

    loadImage(gridPhoto:GridPhoto):Promise<void> {
        console.log("[LOAD IMG]" + gridPhoto.photo.name);
        return new Promise<void>((resolve:Function, reject:Function)=> {
            let tmp:ThumbnailTask = null;
            for (let i = 0; i < this.que.length; i++) {
                if (this.que[i].src == gridPhoto.getThumbnailPath()) {
                    tmp = this.que[i];
                    break;
                }
            }
            if (tmp != null) {
                tmp.resolve.push(resolve);
                tmp.reject.push(reject);
            } else {
                this.que.push({src: gridPhoto.getThumbnailPath(), resolve: [resolve], reject: [reject]});
            }
            this.run();
        });

    }

    isRunning:boolean = false;

    run() {
        if (this.que.length === 0 || this.isRunning === true) {
            return;
        }
        this.isRunning = true;
        let task = this.que.shift();
        console.log("loadingstarted: " + task.src);

        let curImg = new Image();
        curImg.src = task.src;
        curImg.onload = () => {
            console.log(task.src + "done");
            task.resolve.forEach((resolve:()=>{}) => {
                resolve();

            });
            this.isRunning = false;
            this.run();
        };

        curImg.onerror = (error) => {
            console.error(task.src + "error");
            task.reject.forEach((reject:(error)=>{}) => {
                reject(error);
            });
            this.isRunning = false;
            this.run();
        };
    }

}

interface ThumbnailTask {
    src:string;
    resolve:Array<Function>;
    reject:Array<Function>;
}
