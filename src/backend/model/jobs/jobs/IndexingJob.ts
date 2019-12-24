import {JobProgressDTO, JobState} from '../../../../common/entities/settings/JobProgressDTO';
import {ObjectManagers} from '../../ObjectManagers';
import * as path from 'path';
import {Config} from '../../../../common/config/private/Config';
import {Job} from './Job';
import {ConfigTemplateEntry, DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {ServerConfig} from '../../../../common/config/private/IPrivateConfig';

declare var global: NodeJS.Global;
const LOG_TAG = '[IndexingJob]';

export class IndexingJob extends Job {
  public readonly Name = DefaultsJobs[DefaultsJobs.Indexing];
  directoriesToIndex: string[] = [];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;

  public get Supported(): boolean {
    return Config.Server.Database.type !== ServerConfig.DatabaseType.memory;
  }


  protected async init() {
    this.directoriesToIndex.push('/');
  }

  protected async step(): Promise<JobProgressDTO> {
    if (this.directoriesToIndex.length === 0) {
      if (global.gc) {
        global.gc();
      }
      return null;
    }
    const directory = this.directoriesToIndex.shift();
    this.progress.comment = directory;
    this.progress.left = this.directoriesToIndex.length;
    const scanned = await ObjectManagers.getInstance().IndexingManager.indexDirectory(directory);
    if (this.state !== JobState.running) {
      return null;
    }
    this.progress.progress++;
    this.progress.time.current = Date.now();
    for (let i = 0; i < scanned.directories.length; i++) {
      this.directoriesToIndex.push(path.join(scanned.directories[i].path, scanned.directories[i].name));
    }
    return this.progress;
  }


}
