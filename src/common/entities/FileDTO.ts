import {DirectoryBaseDTO, DirectoryDTO} from './DirectoryDTO';

export interface FileBaseDTO {
  id: number;
  name: string;
  directory: DirectoryBaseDTO;
}

export interface FileDTO extends FileBaseDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
}

