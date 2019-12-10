import {DirectoryDTO} from './DirectoryDTO';
import {PhotoDTO} from './PhotoDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {FileDTO} from './FileDTO';
import {SupportedFormats} from '../SupportedFormats';

export interface MediaDTO extends FileDTO {
  id: number;
  name: string;
  directory: DirectoryDTO;
  metadata: MediaMetadata;
  readyThumbnails: Array<number>;
  readyIcon: boolean;
}


export interface MediaMetadata {
  size: MediaDimension;
  creationDate: number;
  fileSize: number;
}


export interface MediaDimension {
  width: number;
  height: number;
}

export module MediaDTO {
  export const hasPositionData = (media: MediaDTO): boolean => {
    return !!(<PhotoDTO>media).metadata.positionData &&
      !!((<PhotoDTO>media).metadata.positionData.city ||
        (<PhotoDTO>media).metadata.positionData.state ||
        (<PhotoDTO>media).metadata.positionData.country ||
        ((<PhotoDTO>media).metadata.positionData.GPSData &&
          (<PhotoDTO>media).metadata.positionData.GPSData.altitude &&
          (<PhotoDTO>media).metadata.positionData.GPSData.latitude &&
          (<PhotoDTO>media).metadata.positionData.GPSData.longitude));
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

  export const isPhoto = (media: MediaDTO): boolean => {
    return !MediaDTO.isVideo(media);
  };

  export const isVideo = (media: MediaDTO): boolean => {
    const lower = media.name.toLowerCase();
    for (const ext of SupportedFormats.WithDots.Videos) {
      if (lower.endsWith(ext)) {
        return true;
      }
    }
    return false;
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
