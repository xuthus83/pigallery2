import {DirectoryDTO} from './DirectoryDTO';
import {MediaDimension, MediaDTO, MediaMetadata} from './MediaDTO';

export interface VideoDTO extends MediaDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
  metadata: VideoMetadata;
}


export interface VideoMetadata extends MediaMetadata {
  size: MediaDimension;
  creationDate: number;
  bitRate: number;
  duration: number; // in milliseconds
  fileSize: number;
  fps: number;
}
