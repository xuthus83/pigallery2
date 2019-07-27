import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {ObjectManagers} from '../ObjectManagers';
import {Config} from '../../../common/config/private/Config';
import {DatabaseType} from '../../../common/config/private/IPrivateConfig';
import {ConfigTemplateEntry, DefaultsTasks} from '../../../common/entities/task/TaskDTO';
import {Task} from './Task';

const LOG_TAG = '[DBRestTask]';

export class DBRestTask extends Task {
  public readonly Name = DefaultsTasks[DefaultsTasks['Database Reset']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;

  public get Supported(): boolean {
    return Config.Server.database.type !== DatabaseType.memory;
  }

  protected async init() {
  }

  protected async step(): Promise<TaskProgressDTO> {
    await ObjectManagers.getInstance().IndexingManager.resetDB();
    return null;
  }


}
