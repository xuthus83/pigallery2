import { Injectable } from '@angular/core';
import { backendText, backendTexts } from '../../../common/BackendTexts';
import { DefaultsJobs } from '../../../common/entities/job/JobDTO';

@Injectable()
export class BackendtextService {

  public get(id: backendText): string {
    switch (id) {
      case backendTexts.sizeToGenerate.name:
        return $localize`Size to generate`;
      case backendTexts.sizeToGenerate.description:
        return $localize`These thumbnails will be generated. The list should be a subset of the enabled thumbnail sizes`;
      case backendTexts.indexedFilesOnly.name:
        return $localize`Indexed only`;
      case backendTexts.indexedFilesOnly.description:
        return $localize`Only checks indexed files.`;
      case backendTexts.indexChangesOnly.name:
        return $localize`Index changes only`;
      case backendTexts.indexChangesOnly.description:
        return $localize`Only indexes a folder if it got changed.`;
      default:
        return null;
    }
  }

  public getJobName(job: DefaultsJobs | string): string {
    if (typeof job === 'string') {
      job = DefaultsJobs[job as any];
    }
    switch (job as DefaultsJobs) {
      case DefaultsJobs.Indexing:
        return $localize`Indexing`;
      case DefaultsJobs['Gallery Reset']:
        return $localize`Gallery reset`;
      case DefaultsJobs['Album Reset']:
        return $localize`Album reset`;
      case DefaultsJobs['Thumbnail Generation']:
        return $localize`Thumbnail generation`;
      case DefaultsJobs['Photo Converting']:
        return $localize`Photo converting`;
      case DefaultsJobs['Video Converting']:
        return $localize`Video converting`;
      case DefaultsJobs['Temp Folder Cleaning']:
        return $localize`Temp folder cleaning`;
      case DefaultsJobs['Preview Filling']:
        return $localize`Preview filling`;
      case DefaultsJobs['Preview Reset']:
        return $localize`Preview reset`;
      case DefaultsJobs['GPX Compression']:
        return $localize`GPX compression`;
      default:
        return DefaultsJobs[job as DefaultsJobs];
    }
  }
}
