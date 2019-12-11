import {TaskProgressDTO, TaskState} from '../../../../common/entities/settings/TaskProgressDTO';
import {Config} from '../../../../common/config/private/Config';
import {ConfigTemplateEntry, DefaultsTasks} from '../../../../common/entities/task/TaskDTO';
import {Task} from './Task';
import {ProjectPath} from '../../../ProjectPath';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {Logger} from '../../../Logger';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import {DiskManager} from '../../DiskManger';
import {VideoConverterMWs} from '../../../middlewares/VideoConverterMWs';

const LOG_TAG = '[VideoConvertingTask]';
const existsPr = util.promisify(fs.exists);


export class VideoConvertingTask extends Task {
  public readonly Name = DefaultsTasks[DefaultsTasks['Video Converting']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;
  directoryQueue: string[] = [];
  videoQueue: string[] = [];

  public get Supported(): boolean {
    return Config.Client.Video.enabled === true;
  }

  protected async init() {
    this.directoryQueue = [];
    this.videoQueue = [];
    this.directoryQueue.push('/');
  }

  protected async step(): Promise<TaskProgressDTO> {
    if ((this.directoryQueue.length === 0 && this.videoQueue.length === 0)
      || this.state !== TaskState.running) {
      if (global.gc) {
        global.gc();
      }
      return null;
    }

    this.progress.left = this.videoQueue.length;
    this.progress.time.current = Date.now();
    if (this.directoryQueue.length > 0) {
      const directory = this.directoryQueue.shift();
      this.progress.comment = 'scanning directory: ' + directory;
      const scanned = await DiskManager.scanDirectory(directory, {noPhoto: true, noMetaFile: true});
      for (let i = 0; i < scanned.directories.length; i++) {
        this.directoryQueue.push(path.join(scanned.directories[i].path, scanned.directories[i].name));
      }

      for (let i = 0; i < scanned.media.length; ++i) {
        if (!MediaDTO.isVideo(scanned.media[i])) {
          continue;
        }
        const videoPath = path.join(ProjectPath.ImageFolder,
          scanned.media[i].directory.path,
          scanned.media[i].directory.name,
          scanned.media[i].name);

        if (await existsPr(VideoConverterMWs.generateConvertedFileName(videoPath)) === false) {
          this.videoQueue.push(videoPath);
        }
      }
    } else if (this.videoQueue.length > 0) {
      const videoPath = this.videoQueue.shift();
      this.progress.progress++;
      this.progress.comment = 'transcoding: ' + videoPath;
      try {
        await VideoConverterMWs.convertVideo(videoPath);
      } catch (e) {
        console.error(e);
        Logger.error(LOG_TAG, 'Error during transcoding a video: ' + e.toString());
      }
    }
    return this.progress;
  }

}
