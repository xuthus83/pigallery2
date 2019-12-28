import {promises as fsp} from 'fs';
import * as path from 'path';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {JobProgressDTO, JobProgressStates} from '../../../common/entities/job/JobProgressDTO';

export class JobProgressManager {
  db: { [key: string]: { progress: JobProgressDTO, timestamp: number } } = {};
  private readonly dbPath: string;
  private timer: NodeJS.Timeout = null;

  constructor() {
    this.dbPath = path.join(ProjectPath.getAbsolutePath(Config.Server.Database.dbFolder), 'jobs.db');
    this.loadDB().catch(console.error);
  }

  get Running(): { [key: string]: JobProgressDTO } {
    const m: { [key: string]: JobProgressDTO } = {};
    for (const key of Object.keys(this.db)) {
      if (this.db[key].progress.state === JobProgressStates.running) {
        m[key] = this.db[key].progress;
        m[key].time.end = Date.now();
      }
    }
    return m;
  }

  get Finished(): { [key: string]: JobProgressDTO } {
    const m: { [key: string]: JobProgressDTO } = {};
    for (const key of Object.keys(this.db)) {
      if (this.db[key].progress.state !== JobProgressStates.running) {
        m[key] = this.db[key].progress;
      }
    }
    return m;
  }

  onJobProgressUpdate(progress: JobProgressDTO) {
    this.db[progress.HashName] = {progress: progress, timestamp: Date.now()};
    this.delayedSave();
  }

  private async loadDB() {
    try {
      await fsp.access(this.dbPath);
    } catch (e) {
      return;
    }
    const data = await fsp.readFile(this.dbPath, 'utf8');
    this.db = JSON.parse(data);

    while (Object.keys(this.db).length > Config.Server.Jobs.maxSavedProgress) {
      let min: string = null;
      for (const key of Object.keys(this.db)) {
        if (min === null || this.db[min].timestamp > this.db[key].timestamp) {
          min = key;
        }
      }
      delete this.db[min];
    }

    for (const key of Object.keys(this.db)) {
      if (this.db[key].progress.state === JobProgressStates.running) {
        this.db[key].progress.state = JobProgressStates.interrupted;
      }
    }
  }

  private async saveDB() {
    await fsp.writeFile(this.dbPath, JSON.stringify(this.db));
  }

  private delayedSave() {
    if (this.timer !== null) {
      return;
    }
    this.timer = setTimeout(async () => {
      this.saveDB().catch(console.error);
      this.timer = null;
    }, 1000);
  }

}
