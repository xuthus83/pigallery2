export  type fieldType = 'string' | 'number' | 'boolean';


export enum DefaultsTasks {
  Indexing, 'Database Reset', Dummy
}

export interface ConfigTemplateEntry {
  id: string;
  name: string;
  type: fieldType;
  defaultValue: any;
}

/*
export interface NestedFieldType {
  [key: string]: fieldType | NestedFieldType;
}*/

export interface TaskDTO {
  Name: string;
  ConfigTemplate: ConfigTemplateEntry[];
}
