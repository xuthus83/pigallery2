import {DirectoryDTO} from "./DirectoryDTO";

export interface PhotoDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
  metadata: PhotoMetadata;
  readyThumbnails: Array<number>;
  readyIcon: boolean;
}

export interface PhotoMetadata {
  keywords: Array<string>;
  cameraData: CameraMetadata;
  positionData: PositionMetaData;
  size: ImageSize;
  creationDate: number;
  fileSize: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface CameraMetadata {
  ISO?: number;
  model?: string;
  maker?: string;
  fStop?: number;
  exposure?: number;
  focalLength?: number;
  lens?: string;
}

export interface PositionMetaData {
  GPSData?: GPSMetadata;
  country?: string;
  state?: string;
  city?: string;
}

export interface GPSMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: string;

}
