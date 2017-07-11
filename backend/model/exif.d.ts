declare module "node-iptc" {

  function e(data): any;

  module e {
  }

  export =  e;
}


declare module "exif-parser" {
  export interface ExifData {
    tags: any;
    imageSize: any;
  }
  export interface ExifObject {
    parse(): ExifData;
  }
  export function create(data: any): ExifObject;

  export function enableTagNames(value: boolean);

  export function enableImageSize(value: boolean);

  export function enableReturnTags(value: boolean);
}

