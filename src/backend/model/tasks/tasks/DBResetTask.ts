import {TaskProgressDTO} from '../../../../common/entities/settings/TaskProgressDTO';
import {ObjectManagers} from '../../ObjectManagers';
import {Config} from '../../../../common/config/private/Config';
import {ConfigTemplateEntry, DefaultsTasks} from '../../../../common/entities/task/TaskDTO';
import {Task} from './Task';
import {ServerConfig} from '../../../../common/config/private/IPrivateConfig';

const LOG_TAG = '[DBRestTask]';

export class DBRestTask extends Task {
  public readonly Name = DefaultsTasks[DefaultsTasks['Database Reset']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;
  protected readonly IsInstant = true;

  public get Supported(): boolean {
    return Config.Server.Database.type !== ServerConfig.DatabaseType.memory;
  }

  protected async init() {
  }

  protected async step(): Promise<TaskProgressDTO> {
    await ObjectManagers.getInstance().IndexingManager.resetDB();
    return null;
  }


}
