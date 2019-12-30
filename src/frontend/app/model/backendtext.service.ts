import {Injectable} from '@angular/core';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {backendText, backendTexts} from '../../../common/BackendTexts';
import {DefaultsJobs} from '../../../common/entities/job/JobDTO';

@Injectable()
export class BackendtextService {


  constructor(private i18n: I18n) {
  }

  public get(id: backendText): string {
    switch (id) {
      case backendTexts.sizeToGenerate.name:
        return this.i18n('Size to generate');
      case backendTexts.sizeToGenerate.description:
        return this.i18n('These thumbnails will be generated. The list should be a subset of the enabled thumbnail sizes');
      case backendTexts.indexedFilesOnly.name:
        return this.i18n('Indexed only');
      case backendTexts.indexedFilesOnly.description:
        return this.i18n('Only checks indexed files.');
      default:
        return null;
    }
  }

  public getJobName(job: DefaultsJobs | string): string {
    if (typeof job === 'string') {
      job = DefaultsJobs[<any>job];
    }
    switch (job as DefaultsJobs) {
      case DefaultsJobs.Indexing:
        return this.i18n('Indexing');
      case DefaultsJobs['Database Reset']:
        return this.i18n('Database Reset');
      case DefaultsJobs['Thumbnail Generation']:
        return this.i18n('Thumbnail Generation');
      case DefaultsJobs['Photo Converting']:
        return this.i18n('Photo Converting');
      case DefaultsJobs['Video Converting']:
        return this.i18n('Video Converting');
      case DefaultsJobs['Temp Folder Cleaning']:
        return this.i18n('Temp Folder Cleaning');
      default:
        return DefaultsJobs[job as DefaultsJobs];
    }
  }
}
