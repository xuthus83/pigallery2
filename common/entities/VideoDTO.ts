import {DirectoryDTO} from './DirectoryDTO';
import {MediaDTO, MediaMetadata} from './MediaDTO';

export interface VideoDTO extends MediaDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
  metadata: MediaMetadata;
}
