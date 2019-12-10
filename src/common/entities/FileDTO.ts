import {DirectoryDTO} from './DirectoryDTO';
import {PhotoDTO} from './PhotoDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {VideoDTO} from './VideoDTO';

export interface FileDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
}

