import {Injectable} from '@angular/core';
import {GalleryCacheService} from './cache.gallery.service';
import {Photo} from './Photo';
import {IconPhoto} from './IconPhoto';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {Config} from '../../../common/config/public/Config';

export enum ThumbnailLoadingPriority {
  extraHigh = 4, high = 3, medium = 2, low = 1
}

@Injectable()
export class ThumbnailLoaderService {

  que: Array<ThumbnailTask> = [];
  runningRequests = 0;

  constructor(private galleryCacheService: GalleryCacheService) {
  }

  run = () => {
    if (this.que.length === 0 || this.runningRequests >= Config.Client.Thumbnail.concurrentThumbnailGenerations) {
      return;
    }
    const task = this.getNextTask();

    if (task === null) {
      return;
    }

    this.runningRequests++;
    task.taskEntities.forEach(te => te.listener.onStartedLoading());
    task.inProgress = true;

    const curImg = new Image();
    curImg.onload = () => {
      task.onLoaded();
      this.galleryCacheService.photoUpdated(task.photo);
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

    curImg.src = task.path;
  };

  removeTask(taskEntry: ThumbnailTaskEntity) {

    const index = taskEntry.parentTask.taskEntities.indexOf(taskEntry);
    if (index === -1) {
      throw new Error('ThumbnailTaskEntity not exist on Task');
    }
    taskEntry.parentTask.taskEntities.splice(index, 1);

    if (taskEntry.parentTask.taskEntities.length === 0
      && taskEntry.parentTask.inProgress === false) {
      const i = this.que.indexOf(taskEntry.parentTask);
      if (i === -1) {
        throw new Error('ThumbnailTask not exist');
      }
      this.que.splice(i, 1);
    }

  }

  loadIcon(photo: IconPhoto, priority: ThumbnailLoadingPriority, listener: ThumbnailLoadingListener): ThumbnailTaskEntity {
    let thTask: ThumbnailTask = null;
    // is image already qued?
    for (let i = 0; i < this.que.length; i++) {
      if (this.que[i].path === photo.getIconPath()) {
        thTask = this.que[i];
        break;
      }
    }
    if (thTask == null) {
      thTask = {
        photo: photo.photo,
        inProgress: false,
        taskEntities: [],
        onLoaded: () => {
          photo.iconLoaded();
        },
        path: photo.getIconPath()
      };
      this.que.push(thTask);
    }

    const thumbnailTaskEntity = {priority: priority, listener: listener, parentTask: thTask};
    thTask.taskEntities.push(thumbnailTaskEntity);
    if (thTask.inProgress === true) {
      listener.onStartedLoading();
    }


    setTimeout(this.run, 0);
    return thumbnailTaskEntity;
  }

  loadImage(photo: Photo, priority: ThumbnailLoadingPriority, listener: ThumbnailLoadingListener): ThumbnailTaskEntity {

    let thTask: ThumbnailTask = null;
    // is image already qued?
    for (let i = 0; i < this.que.length; i++) {
      if (this.que[i].path === photo.getThumbnailPath()) {
        thTask = this.que[i];
        break;
      }
    }
    if (thTask == null) {
      thTask = {
        photo: photo.photo,
        inProgress: false,
        taskEntities: [],
        onLoaded: () => {
          photo.thumbnailLoaded();
        },
        path: photo.getThumbnailPath()
      };
      this.que.push(thTask);
    }

    const thumbnailTaskEntity = {priority: priority, listener: listener, parentTask: thTask};

    // add to poolTask
    thTask.taskEntities.push(thumbnailTaskEntity);
    if (thTask.inProgress === true) {
      listener.onStartedLoading();
    }

    setTimeout(this.run, 0);
    return thumbnailTaskEntity;

  }

  private getNextTask(): ThumbnailTask {
    if (this.que.length === 0) {
      return null;
    }

    let highestPriority: ThumbnailTask = null;
    let currentPriority: ThumbnailLoadingPriority = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < this.que.length; i++) {
      for (let j = 0; j < this.que[i].taskEntities.length; j++) {
        if (this.que[i].inProgress === false) {
          if (highestPriority == null || currentPriority < this.que[i].taskEntities[j].priority) {
            highestPriority = this.que[i];
            currentPriority = this.que[i].taskEntities[j].priority;
            if (currentPriority === ThumbnailLoadingPriority.extraHigh) {
              return highestPriority;
            }
          }
        }
      }
    }

    return highestPriority;
  }

  private taskReady(task: ThumbnailTask) {
    const i = this.que.indexOf(task);
    if (i === -1) {
      if (task.taskEntities.length !== 0) {
        console.error('ThumbnailLoader: can\'t find poolTask to remove');
      }
      return;
    }
    this.que.splice(i, 1);
  }
}


export interface ThumbnailLoadingListener {
  onStartedLoading: () => void;
  onLoad: () => void;
  onError: (error: any) => void;
}


export interface ThumbnailTaskEntity {
  priority: ThumbnailLoadingPriority;
  listener: ThumbnailLoadingListener;
  parentTask: ThumbnailTask;
}

interface ThumbnailTask {
  photo: PhotoDTO;
  inProgress: boolean;
  taskEntities: Array<ThumbnailTaskEntity>;
  path: string;
  onLoaded: Function;
}

