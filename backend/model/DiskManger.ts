///<reference path="exif.d.ts"/>


import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";
import * as iptc from "node-iptc";
import * as exif_parser from "exif-parser";
import {Directory} from "../../common/entities/Directory";
import {
    Photo,
    PhotoMetadata,
    ImageSize,
    CameraMetadata,
    PositionMetaData,
    GPSMetadata
} from "../../common/entities/Photo";
import {ProjectPath} from "../ProjectPath";

export class DiskManager {
    public static scanDirectory(relativeDirectoryName, cb:(error:any, result:Directory) => void) {
        console.log("DiskManager: scanDirectory");
        let directoryName = path.basename(relativeDirectoryName);
        let directoryParent = path.join(path.dirname(relativeDirectoryName), "/");
        let absoluteDirectoryName = path.join(ProjectPath.ImageFolder, relativeDirectoryName);

        let directory = new Directory(1, directoryName, directoryParent, new Date(), [], []);

        let promises:Array< Promise<any> > = [];
        fs.readdir(absoluteDirectoryName, function (err, list) {

            if (err) {
                return cb(err, null);
            }


            for (let i = 0; i < list.length; i++) {
                let file = list[i];
                let fullFilePath = path.resolve(absoluteDirectoryName, file);
                if (fs.statSync(fullFilePath).isDirectory()) {
                    directory.directories.push(new Directory(2, file, relativeDirectoryName, new Date(), [], []));
                }

                if (DiskManager.isImage(fullFilePath)) {


                    let promise = DiskManager.loadPhotoMetadata(fullFilePath).then((photoMetadata)=> {
                        directory.photos.push(new Photo(1, file, directory, photoMetadata));
                    });

                    promises.push(promise);
                }
            }

            Promise.all(promises).then(()=> {
                return cb(err, directory);
            });

        });
    }

    private static isImage(fullPath) {
        let imageMimeTypes = [
            'image/bmp',
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/pjpeg',
            'image/tiff',
            'image/webp',
            'image/x-tiff',
            'image/x-windows-bmp'
        ];

        var extension = mime.lookup(fullPath);

        if (imageMimeTypes.indexOf(extension) !== -1) {
            return true;
        }

        return false;
    }

    /*
     UTF8 = {

     encode: function(s){

     for(var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;

     s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]

     );

     return s.join("");

     },

     decode: function(s){

     for(var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;

     ((a = s[i][c](0)) & 0x80) &&

     (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?

     o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")

     );

     return s.join("");

     }

     };*/
    private static loadPhotoMetadata(fullPath):Promise<PhotoMetadata> {
        return new Promise<PhotoMetadata>((resolve:(metadata:PhotoMetadata)=>void, reject) => {
            fs.readFile(fullPath, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    let exif = exif_parser.create(data).parse();
                    let iptcData = iptc(data);

                    let imageSize:ImageSize = {width: exif.imageSize.width, height: exif.imageSize.height};
                    let cameraData:CameraMetadata = {
                        ISO: exif.tags.ISO,
                        model: exif.tags.Modeol,
                        maker: exif.tags.Make,
                        fStop: exif.tags.FNumber,
                        exposure: exif.tags.ExposureTime,
                        focalLength: exif.tags.FocalLength,
                        lens: exif.tags.LensModel,
                    };
                    let GPS:GPSMetadata = {
                        latitude: exif.tags.GPSLatitude,
                        longitude: exif.tags.GPSLongitude,
                        altitude: exif.tags.GPSAltitude

                    };

                    let positionData:PositionMetaData = {
                        GPSData: GPS,
                        country: iptcData.country_or_primary_location_name,
                        state: iptcData.province_or_state,
                        city: iptcData.city
                    };

                    //Decode characters to UTF8
                    let decode = (s)=> {
                        for (var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;

                             ((a = s[i][c](0)) & 0x80) &&

                             (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?

                                 o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
                        );
                        return s.join("");
                    };

                    let keywords:[string] = iptcData.keywords.map(s => decode(s));
                    let creationDate:Date = iptcData.date_time;
                    console.log(keywords);


                    let metadata:PhotoMetadata = new PhotoMetadata(keywords, cameraData, positionData, imageSize, creationDate);
                    resolve(metadata);
                }
            });
        });


    }
}