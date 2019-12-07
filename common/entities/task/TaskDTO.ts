export  type fieldType = 'string' | 'number' | 'boolean';


export enum DefaultsTasks {
  Indexing = 1, 'Database Reset' = 2
}

export interface ConfigTemplateEntry {
  id: string;
  name: string;
  type: fieldType;
  defaultValue: any;
}

export interface TaskDTO {
  Name: string;
  ConfigTemplate: ConfigTemplateEntry[];
}
