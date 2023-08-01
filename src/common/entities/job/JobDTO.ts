import {backendText} from '../../BackendTexts';

export type fieldType = 'string' | 'email' | 'number' | 'boolean' | 'number-array' | 'SearchQuery' | 'sort-array';

export enum DefaultsJobs {
  Indexing = 1,
  'Gallery Reset' = 2,
  'Video Converting' = 3,
  'Photo Converting' = 4,
  'Thumbnail Generation' = 5,
  'Temp Folder Cleaning' = 6,
  'Preview Filling' = 7,
  'Preview Reset' = 8,
  'GPX Compression' = 9,
  'Album Reset' = 10,
  'Delete Compressed GPX' = 11,
  'Top Pick Sending' = 12
}

export interface ConfigTemplateEntry {
  id: string;
  name: backendText;
  description: backendText;
  type: fieldType;
  defaultValue: any;
}

export interface JobDTO {
  Name: string;
  ConfigTemplate: ConfigTemplateEntry[];
}

export const JobDTOUtils = {
  getHashName: (jobName: string, config: any = {}) => {
    const sorted = Object.keys(config).sort().reduce((ret, key) => `${ret},${key}:${JSON.stringify(config[key])}`, '');
    return jobName + '-' + JSON.stringify(sorted);
  },
};
