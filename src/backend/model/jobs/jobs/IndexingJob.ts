import {ObjectManagers} from '../../ObjectManagers';
import * as path from 'path';
import {Config} from '../../../../common/config/private/Config';
import {Job} from './Job';
import {ConfigTemplateEntry, DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {JobProgressStates} from '../../../../common/entities/job/JobProgressDTO';
import {DatabaseType, ServerConfig} from '../../../../common/config/private/PrivateConfig';


export class IndexingJob extends Job {
  public readonly Name = DefaultsJobs[DefaultsJobs.Indexing];
  directoriesToIndex: string[] = [];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;

  public get Supported(): boolean {
    return Config.Server.Database.type !== DatabaseType.memory;
  }


  protected async init(): Promise<void> {
    this.directoriesToIndex.push('/');
  }

  protected async step(): Promise<boolean> {
    if (this.directoriesToIndex.length === 0) {
      if (ObjectManagers.getInstance().IndexingManager.IsSavingInProgress) {
        await ObjectManagers.getInstance().IndexingManager.SavingReady;
      }
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
    for (const item of scanned.directories) {
      this.directoriesToIndex.push(path.join(item.path, item.name));
    }
    return true;
  }


}
