import {DirectoryDTO} from './DirectoryDTO';

export interface FileDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
}

