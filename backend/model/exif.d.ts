declare module 'node-iptc' {

  function e(data): any;

  module e {
  }

  export = e;
}


declare module 'exif-parser' {
  export interface ExifData {
    tags: any;
    imageSize: any;
  }

  export interface ExifObject {
    enableTagNames(value: boolean);

    enableImageSize(value: boolean);

    enableReturnTags(value: boolean);

    parse(): ExifData;

  }

  export function create(data: any): ExifObject;

}

