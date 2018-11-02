import {DirectoryDTO} from './DirectoryDTO';
import {ImageSize} from './PhotoDTO';
import {OrientationTypes} from 'ts-exif-parser';

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
  orientation: OrientationTypes;
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
  make?: string;
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
  altitude?: number;
}

export module PhotoDTO {
  export const hasPositionData = (photo: PhotoDTO): boolean => {
    return !!photo.metadata.positionData &&
      !!(photo.metadata.positionData.city ||
        photo.metadata.positionData.state ||
        photo.metadata.positionData.country ||
        (photo.metadata.positionData.GPSData &&
          photo.metadata.positionData.GPSData.altitude &&
          photo.metadata.positionData.GPSData.latitude &&
          photo.metadata.positionData.GPSData.longitude));
  };

  export const isSideWay = (photo: PhotoDTO): boolean => {
    return photo.metadata.orientation === OrientationTypes.LEFT_TOP ||
      photo.metadata.orientation === OrientationTypes.RIGHT_TOP ||
      photo.metadata.orientation === OrientationTypes.LEFT_BOTTOM ||
      photo.metadata.orientation === OrientationTypes.RIGHT_BOTTOM;

  };

  export const getRotatedSize = (photo: PhotoDTO): ImageSize => {
    if (isSideWay(photo)) {
      // noinspection JSSuspiciousNameCombination
      return {width: photo.metadata.size.height, height: photo.metadata.size.width};
    }
    return photo.metadata.size;
  };

  export const calcRotatedAspectRatio = (photo: PhotoDTO): number => {
    const size = getRotatedSize(photo);
    return size.width / size.height;
  };
}
