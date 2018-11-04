import {DirectoryDTO} from './DirectoryDTO';
import {PhotoDTO} from './PhotoDTO';
import {OrientationTypes} from 'ts-exif-parser';

export interface MediaDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
  metadata: MediaMetadata;
  readyThumbnails: Array<number>;
  readyIcon: boolean;
}


export interface MediaMetadata {
  keywords: string[];
  positionData: PositionMetaData;
  size: MediaDimension;
  creationDate: number;
  fileSize: number;
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

export interface MediaDimension {
  width: number;
  height: number;
}

export module MediaDTO {
  export const hasPositionData = (media: MediaDTO): boolean => {
    return !!media.metadata.positionData &&
      !!(media.metadata.positionData.city ||
        media.metadata.positionData.state ||
        media.metadata.positionData.country ||
        (media.metadata.positionData.GPSData &&
          media.metadata.positionData.GPSData.altitude &&
          media.metadata.positionData.GPSData.latitude &&
          media.metadata.positionData.GPSData.longitude));
  };

  export const isSideWay = (media: MediaDTO): boolean => {
    if (!(<PhotoDTO>media).metadata.orientation) {
      return false;
    }
    const photo = <PhotoDTO>media;
    return photo.metadata.orientation === OrientationTypes.LEFT_TOP ||
      photo.metadata.orientation === OrientationTypes.RIGHT_TOP ||
      photo.metadata.orientation === OrientationTypes.LEFT_BOTTOM ||
      photo.metadata.orientation === OrientationTypes.RIGHT_BOTTOM;

  };

  export const getRotatedSize = (photo: MediaDTO): MediaDimension => {
    if (isSideWay(photo)) {
      // noinspection JSSuspiciousNameCombination
      return {width: photo.metadata.size.height, height: photo.metadata.size.width};
    }
    return photo.metadata.size;
  };

  export const calcRotatedAspectRatio = (photo: MediaDTO): number => {
    const size = getRotatedSize(photo);
    return size.width / size.height;
  };
}
