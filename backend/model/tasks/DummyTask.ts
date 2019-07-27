import {TaskProgressDTO} from '../../../common/entities/settings/TaskProgressDTO';
import {ConfigTemplateEntry, DefaultsTasks} from '../../../common/entities/task/TaskDTO';
import {Utils} from '../../../common/Utils';
import {Task} from './Task';

const LOG_TAG = '[DummyTask]';

export class DummyTask extends Task {
  public readonly Name = DefaultsTasks[DefaultsTasks.Dummy];
  counter = 0;

  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;


  public get Supported(): boolean {
    return true;
  }

  protected async init() {
    this.counter = 0;
  }

  protected async step(): Promise<TaskProgressDTO> {
    await Utils.wait(1000);
    if (!this.running) {
      return null;
    }
    this.counter++;
    this.progress.progress = this.counter;
    this.progress.left = Math.pow(10, Math.floor(Math.log10(this.counter)) + 1) - this.counter;
    return this.progress;
  }


}
