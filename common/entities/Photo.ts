import {Directory} from "./Directory";

export class Photo {
    constructor(public id?:number,
                public name?:string,
                public directory?:Directory,
                public metadata?:PhotoMetadata) {
    }
}

export class PhotoMetadata {
    constructor(public keywords?:Array<string>,
                public cameraData?:CameraMetadata,
                public positionData?:PositionMetaData,
                public size?:ImageSize,
                public creationDate?:Date) {
    }
}

export interface ImageSize {
    width:number;
    height:number;
}

export interface CameraMetadata {
    ISO?:number;
    model?:string;
    maker?:string;
    fStop?:number;
    exposure?:number;
    focalLength?:number;
    lens?:string;
}

export interface PositionMetaData {
    GPSData?:GPSMetadata;
    country?:string;
    state?:string;
    city?:string;
}

export interface GPSMetadata {
    latitude?:string;
    longitude?:string;
    altitude?:string;

}