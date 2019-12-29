import {promises as fsp} from 'fs';
import * as path from 'path';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {JobProgressDTO, JobProgressStates} from '../../../common/entities/job/JobProgressDTO';

export class JobProgressManager {
  private static readonly VERSION = 1;
  db: {
    version: number,
    db: { [key: string]: { progress: JobProgressDTO, timestamp: number } }
  } = {
    version: JobProgressManager.VERSION,
    db: {}
  };
  private readonly dbPath: string;
  private timer: NodeJS.Timeout = null;

  constructor() {
    this.dbPath = path.join(ProjectPath.getAbsolutePath(Config.Server.Database.dbFolder), 'jobs.db');
    this.loadDB().catch(console.error);
  }

  get Running(): { [key: string]: JobProgressDTO } {
    const m: { [key: string]: JobProgressDTO } = {};
    for (const key of Object.keys(this.db.db)) {
      if (this.db.db[key].progress.state === JobProgressStates.running) {
        m[key] = this.db.db[key].progress;
        m[key].time.end = Date.now();
      }
    }
    return m;
  }

  get Finished(): { [key: string]: JobProgressDTO } {
    const m: { [key: string]: JobProgressDTO } = {};
    for (const key of Object.keys(this.db.db)) {
      if (this.db.db[key].progress.state !== JobProgressStates.running) {
        m[key] = this.db.db[key].progress;
      }
    }
    return m;
  }

  onJobProgressUpdate(progress: JobProgressDTO) {
    this.db.db[progress.HashName] = {progress: progress, timestamp: Date.now()};
    this.delayedSave();
  }

  private async loadDB() {
    try {
      await fsp.access(this.dbPath);
    } catch (e) {
      return;
    }
    const data = await fsp.readFile(this.dbPath, 'utf8');
    const db = JSON.parse(data);
    if (db.version !== JobProgressManager.VERSION) {
      return;
    }
    this.db = db;

    while (Object.keys(this.db.db).length > Config.Server.Jobs.maxSavedProgress) {
      let min: string = null;
      for (const key of Object.keys(this.db.db)) {
        if (min === null || this.db.db[min].timestamp > this.db.db[key].timestamp) {
          min = key;
        }
      }
      delete this.db.db[min];
    }

    for (const key of Object.keys(this.db.db)) {
      if (this.db.db[key].progress.state === JobProgressStates.running) {
        this.db.db[key].progress.state = JobProgressStates.interrupted;
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
