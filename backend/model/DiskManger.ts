///<reference path="exif.d.ts"/>
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";
import * as iptc from "node-iptc";
import * as exif_parser from "exif-parser";
import {DirectoryDTO} from "../../common/entities/DirectoryDTO";
import {
    PhotoDTO,
    PhotoMetadata,
    ImageSize,
    CameraMetadata,
    PositionMetaData,
    GPSMetadata
} from "../../common/entities/PhotoDTO";
import {ProjectPath} from "../ProjectPath";

export class DiskManager {
    public static scanDirectory(relativeDirectoryName: string, cb: (error: any, result: DirectoryDTO) => void) {
        console.log("DiskManager: scanDirectory");
        let directoryName = path.normalize(path.basename(relativeDirectoryName));
        let directoryParent = path.normalize(path.join(path.dirname(relativeDirectoryName), "/"));
        let absoluteDirectoryName = path.normalize(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
        console.log(directoryName, directoryParent, path.dirname(relativeDirectoryName), path.join(path.dirname(relativeDirectoryName), "/"));

        let directory = <DirectoryDTO>{
            name: directoryName,
            path: directoryParent,
            lastUpdate: new Date(),
            directories: [],
            photos: []
        };

        let promises: Array< Promise<any> > = [];
        fs.readdir(absoluteDirectoryName, function (err, list) {

            if (err) {
                return cb(err, null);
            }


            for (let i = 0; i < list.length; i++) {
                let file = list[i];
                let fullFilePath = path.normalize(path.resolve(absoluteDirectoryName, file));
                if (fs.statSync(fullFilePath).isDirectory()) {
                    directory.directories.push(<DirectoryDTO>{
                        name: file,
                        path: relativeDirectoryName,
                        lastUpdate: new Date(),
                        directories: [],
                        photos: []
                    });
                }

                if (DiskManager.isImage(fullFilePath)) {


                    let promise = DiskManager.loadPhotoMetadata(fullFilePath).then((photoMetadata) => {
                        directory.photos.push(<PhotoDTO>{name: file, directory: directory, metadata: photoMetadata});
                    });

                    promises.push(promise);
                }
            }

            Promise.all(promises).then(() => {
                return cb(err, directory);
            });

        });
    }

    private static isImage(fullPath: string) {
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

        let extension = mime.lookup(fullPath);

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
    private static loadPhotoMetadata(fullPath: string): Promise<PhotoMetadata> {
        return new Promise<PhotoMetadata>((resolve: (metadata: PhotoMetadata) => void, reject) => {
            fs.readFile(fullPath, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    let exif = exif_parser.create(data).parse();
                    let iptcData = iptc(data);

                    let imageSize: ImageSize = {width: exif.imageSize.width, height: exif.imageSize.height};
                    let cameraData: CameraMetadata = {
                        ISO: exif.tags.ISO,
                        model: exif.tags.Modeol,
                        maker: exif.tags.Make,
                        fStop: exif.tags.FNumber,
                        exposure: exif.tags.ExposureTime,
                        focalLength: exif.tags.FocalLength,
                        lens: exif.tags.LensModel,
                    };
                    let GPS: GPSMetadata = {
                        latitude: exif.tags.GPSLatitude,
                        longitude: exif.tags.GPSLongitude,
                        altitude: exif.tags.GPSAltitude

                    };

                    let positionData: PositionMetaData = {
                        GPSData: GPS,
                        country: iptcData.country_or_primary_location_name,
                        state: iptcData.province_or_state,
                        city: iptcData.city
                    };

                    //Decode characters to UTF8
                    let decode = (s: any) => {
                        for (let a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
                             ((a = s[i][c](0)) & 0x80) &&
                             (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
                                 o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
                        );
                        return s.join("");
                    };

                    let keywords: [string] = iptcData.keywords.map((s: string) => decode(s));
                    let creationDate: Date = iptcData.date_time;


                    let metadata: PhotoMetadata = <PhotoMetadata>{
                        keywords: keywords,
                        cameraData: cameraData,
                        positionData: positionData,
                        size: imageSize,
                        creationDate: creationDate
                    };
                    resolve(metadata);
                }
            });
        });


    }
}