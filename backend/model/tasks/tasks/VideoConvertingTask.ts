import {TaskProgressDTO} from '../../../../common/entities/settings/TaskProgressDTO';
import {Config} from '../../../../common/config/private/Config';
import {ConfigTemplateEntry, DefaultsTasks} from '../../../../common/entities/task/TaskDTO';
import {Task} from './Task';
import {ProjectPath} from '../../../ProjectPath';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {Logger} from '../../../Logger';
import * as path from 'path';
import {DiskManager} from '../../DiskManger';
import {VideoConverterMWs} from '../../../middlewares/VideoConverterMWs';
import {VideoDTO} from '../../../../common/entities/VideoDTO';

const LOG_TAG = '[VideoConvertingTask]';

export class VideoConvertingTask extends Task {
  public readonly Name = DefaultsTasks[DefaultsTasks['Video Converting']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;
  queue: (string | VideoDTO)[] = [];

  public get Supported(): boolean {
    return Config.Client.Video.enabled === true;
  }

  protected async init() {
    this.queue.push('/');
  }

  protected async step(): Promise<TaskProgressDTO> {
    if (this.queue.length === 0) {
      if (global.gc) {
        global.gc();
      }
      return null;
    }
    if (this.running === false) {
      return null;
    }
    const entry = this.queue.shift();
    this.progress.left = this.queue.length;
    this.progress.progress++;
    this.progress.time.current = Date.now();
    if (typeof entry === 'string') {
      const directory = entry;
      this.progress.comment = 'scanning directory: ' + entry;
      const scanned = await DiskManager.scanDirectory(directory, {noPhoto: true, noMetaFile: true});
      for (let i = 0; i < scanned.directories.length; i++) {
        this.queue.push(path.join(scanned.directories[i].path, scanned.directories[i].name));
      }
      this.queue = this.queue.concat(<VideoDTO[]>scanned.media.filter(m => MediaDTO.isVideo(m)));
    } else {
      const video: VideoDTO = entry;
      const videoPath = path.join(ProjectPath.ImageFolder, video.directory.path, video.directory.name, video.name);
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
