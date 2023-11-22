import {DirectoryPathDTO} from './DirectoryDTO';
import {MediaDimension, MediaDTO, MediaMetadata} from './MediaDTO';
import {PositionMetaData, CameraMetadata, RatingTypes} from './PhotoDTO';

export interface VideoDTO extends MediaDTO {
  id: number;
  name: string;
  directory: DirectoryPathDTO;
  metadata: VideoMetadata;
}

export interface VideoMetadata extends MediaMetadata {
  size: MediaDimension;
  creationDate: number;
  bitRate: number;
  duration: number; // in milliseconds
  fileSize: number;
  fps: number;
  keywords?: string[];
  rating?: RatingTypes;
}
