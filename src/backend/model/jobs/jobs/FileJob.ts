import {JobProgressDTO, JobState} from '../../../../common/entities/settings/JobProgressDTO';
import {ConfigTemplateEntry} from '../../../../common/entities/job/JobDTO';
import {Job} from './Job';
import * as path from 'path';
import {DiskManager} from '../../DiskManger';
import {DiskMangerWorker} from '../../threading/DiskMangerWorker';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {Logger} from '../../../Logger';
import {MediaDTO} from '../../../../common/entities/MediaDTO';

declare var global: NodeJS.Global;


const LOG_TAG = '[FileTask]';


export abstract class FileJob<T, S = void> extends Job<S> {
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;
  directoryQueue: string[] = [];
  fileQueue: T[] = [];


  protected constructor(private scanFilter: DiskMangerWorker.DirectoryScanSettings) {
    super();
  }

  protected async init() {
    this.directoryQueue = [];
    this.fileQueue = [];
    this.directoryQueue.push('/');
  }

  protected abstract async processDirectory(directory: DirectoryDTO): Promise<T[]>;

  protected abstract async processFile(file: T): Promise<void>;

  protected async step(): Promise<JobProgressDTO> {
    if ((this.directoryQueue.length === 0 && this.fileQueue.length === 0)
      || this.state !== JobState.running) {
      if (global.gc) {
        global.gc();
      }
      return null;
    }

    this.progress.time.current = Date.now();
    if (this.directoryQueue.length > 0) {
      const directory = this.directoryQueue.shift();
      this.progress.comment = 'scanning directory: ' + directory;
      const scanned = await DiskManager.scanDirectory(directory, this.scanFilter);
      for (let i = 0; i < scanned.directories.length; i++) {
        this.directoryQueue.push(path.join(scanned.directories[i].path, scanned.directories[i].name));
      }
      this.fileQueue.push(...await this.processDirectory(scanned));
    } else if (this.fileQueue.length > 0) {
      const file = this.fileQueue.shift();
      this.progress.left = this.fileQueue.length;
      this.progress.progress++;
      this.progress.comment = 'processing: ' + file;
      try {
        await this.processFile(file);
      } catch (e) {
        console.error(e);
        Logger.error(LOG_TAG, 'Error during processing file: ' + e.toString());
      }
    }
    return this.progress;
  }

}
