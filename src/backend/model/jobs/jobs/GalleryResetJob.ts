import {ObjectManagers} from '../../ObjectManagers';
import {ConfigTemplateEntry, DefaultsJobs,} from '../../../../common/entities/job/JobDTO';
import {Job} from './Job';

export class GalleryRestJob extends Job {
  public readonly Name = DefaultsJobs[DefaultsJobs['Gallery Reset']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;
  protected readonly IsInstant = true;

  public get Supported(): boolean {
    return true;
  }

  protected async init(): Promise<void> {
    // abstract function
  }

  protected async step(): Promise<boolean> {
    this.Progress.Left = 1;
    this.Progress.Processed++;
    await ObjectManagers.getInstance().IndexingManager.resetDB();
    return false;
  }
}
