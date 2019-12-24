import {JobProgressDTO} from '../../../../common/entities/settings/JobProgressDTO';
import {ObjectManagers} from '../../ObjectManagers';
import {Config} from '../../../../common/config/private/Config';
import {ConfigTemplateEntry, DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {Job} from './Job';
import {ServerConfig} from '../../../../common/config/private/IPrivateConfig';

const LOG_TAG = '[DBRestJob]';

export class DBRestJob extends Job {
  public readonly Name = DefaultsJobs[DefaultsJobs['Database Reset']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;
  protected readonly IsInstant = true;

  public get Supported(): boolean {
    return Config.Server.Database.type !== ServerConfig.DatabaseType.memory;
  }

  protected async init() {
  }

  protected async step(): Promise<JobProgressDTO> {
    await ObjectManagers.getInstance().IndexingManager.resetDB();
    return null;
  }


}
