import {ObjectManagers} from '../../ObjectManagers';
import * as path from 'path';
import {Config} from '../../../../common/config/private/Config';
import {Job} from './Job';
import {ConfigTemplateEntry, DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {ServerConfig} from '../../../../common/config/private/IPrivateConfig';
import {JobProgressStates} from '../../../../common/entities/job/JobProgressDTO';

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

  protected async step(): Promise<boolean> {
    if (this.directoriesToIndex.length === 0) {
      return false;
    }
    const directory = this.directoriesToIndex.shift();
    this.Progress.log(directory);
    this.Progress.Left = this.directoriesToIndex.length;
    const scanned = await ObjectManagers.getInstance().IndexingManager.indexDirectory(directory);
    if (this.Progress.State !== JobProgressStates.running) {
      return false;
    }
    this.Progress.Processed++;
    for (let i = 0; i < scanned.directories.length; i++) {
      this.directoriesToIndex.push(path.join(scanned.directories[i].path, scanned.directories[i].name));
    }
    return true;
  }


}
