import {Injectable} from "@angular/core";
import {GridPhoto} from "./GridPhoto";
import {Config} from "../../config/Config";
import {GalleryCacheService} from "../cache.gallery.service";

export enum ThumbnailLoadingPriority{
    high, medium, low
}

@Injectable()
export class ThumbnailLoaderService {

    que: Array<ThumbnailTask> = [];
    runningRequests: number = 0;

    constructor(private galleryChacheService: GalleryCacheService) {
    }

    removeTasks() {
        this.que = [];
    }

    removeTask(taskEntry: ThumbnailTaskEntity) {

        for (let i = 0; i < this.que.length; i++) {
            let index = this.que[i].taskEntities.indexOf(taskEntry);
            if (index == -1) {
                this.que[i].taskEntities.splice(index, 1);
                if (this.que[i].taskEntities.length == 0) {
                    this.que.splice(i, 1);

                }
                return;
            }
        }

    }

    loadImage(gridPhoto: GridPhoto, priority: ThumbnailLoadingPriority, listener: ThumbnailLoadingListener): ThumbnailTaskEntity {

        let tmp: ThumbnailTask = null;
        //is image already qued?
        for (let i = 0; i < this.que.length; i++) {
            if (this.que[i].gridPhoto.getThumbnailPath() == gridPhoto.getThumbnailPath()) {
                tmp = this.que[i];
                break;
            }
        }

        let thumbnailTaskEntity = {priority: priority, listener: listener};
        //add to previous
        if (tmp != null) {
            tmp.taskEntities.push(thumbnailTaskEntity);
            if (tmp.inProgress == true) {
                listener.onStartedLoading();
            }


        } else {//create new task
            this.que.push({
                gridPhoto: gridPhoto,
                inProgress: false,
                taskEntities: [thumbnailTaskEntity]
            });
        }
        setImmediate(this.run);
        return thumbnailTaskEntity;

    }


    private getNextTask(): ThumbnailTask {
        if (this.que.length === 0) {
            return null;
        }

        for (let i = 0; i < this.que.length; i++) {
            for (let j = 0; j < this.que[i].taskEntities.length; j++) {
                if (this.que[i].inProgress == false && this.que[i].taskEntities[j].priority === ThumbnailLoadingPriority.high) {
                    return this.que[i];
                }
            }
        }

        for (let i = 0; i < this.que.length; i++) {
            for (let j = 0; j < this.que[i].taskEntities.length; j++) {
                if (this.que[i].inProgress == false && this.que[i].taskEntities[j].priority === ThumbnailLoadingPriority.medium) {
                    return this.que[i];
                }
            }
        }


        for (let i = 0; i < this.que.length; i++) {
            if (this.que[i].inProgress == false) {
                return this.que[i];
            }

        }

        return null;
    }

    private taskReady(task: ThumbnailTask) {
        let i = this.que.indexOf(task);
        if (i == -1) {
            if (task.taskEntities.length !== 0) {
                console.error("ThumbnailLoader: can't find task to remove");
            }
            return;
        }
        this.que.splice(i, 1);
    }


    run = () => {
        if (this.que.length === 0 || this.runningRequests >= Config.Client.concurrentThumbnailGenerations) {
            return;
        }
        let task = this.getNextTask();

        if (task === null) {
            return;
        }

        this.runningRequests++;
        task.taskEntities.forEach(te => te.listener.onStartedLoading());
        task.inProgress = true;

        let curImg = new Image();
        curImg.onload = () => {
            task.gridPhoto.thumbnailLoaded();
            this.galleryChacheService.photoUpdated(task.gridPhoto.photo);
            task.taskEntities.forEach((te: ThumbnailTaskEntity) => te.listener.onLoad());

            this.taskReady(task);
            this.runningRequests--;
            this.run();
        };

        curImg.onerror = (error) => {
            task.taskEntities.forEach((te: ThumbnailTaskEntity) => te.listener.onError(error));

            this.taskReady(task);
            this.runningRequests--;
            this.run();
        };

        curImg.src = task.gridPhoto.getThumbnailPath();
    };
}


export interface ThumbnailLoadingListener {
    onStartedLoading: () => void;
    onLoad: () => void;
    onError: (error: any) => void;
}


export interface ThumbnailTaskEntity {

    priority: ThumbnailLoadingPriority;
    listener: ThumbnailLoadingListener;
}

interface ThumbnailTask {
    gridPhoto: GridPhoto;
    inProgress: boolean;
    taskEntities: Array<ThumbnailTaskEntity>;

}
