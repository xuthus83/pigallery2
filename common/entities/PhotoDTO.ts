import {DirectoryDTO} from "./DirectoryDTO";

export interface PhotoDTO {
    id: number;
    name: string;
    directory: DirectoryDTO;
    metadata: PhotoMetadata;
    readyThumbnails: Array<number>;
}

export interface PhotoMetadata {
    keywords: Array<string>;
    cameraData: CameraMetadata;
    positionData: PositionMetaData;
    size: ImageSize;
    creationDate: number;
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
    latitude?: string;
    longitude?: string;
    altitude?: string;

}