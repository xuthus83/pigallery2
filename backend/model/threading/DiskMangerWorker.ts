///<reference path="../exif.d.ts"/>
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {CameraMetadata, GPSMetadata, ImageSize, PhotoDTO, PhotoMetadata} from "../../../common/entities/PhotoDTO";
import {Logger} from "../../Logger";
import * as fs from "fs";
import * as path from "path";
import {IptcParser} from "ts-node-iptc";
import * as exif_parser from "exif-parser";
import {ProjectPath} from "../../ProjectPath";
import {Config} from "../../../common/config/private/Config";

const LOG_TAG = "[DiskManagerTask]";
export class DiskMangerWorker {
  private static isImage(fullPath: string) {
    const extensions = [
      '.bmp',
      '.gif',
      '.jpeg', '.jpg', '.jpe',
      '.png',
      '.tiff', '.tif',
      '.webp',
      '.ico',
      '.tga'
    ];

    const extension = path.extname(fullPath).toLowerCase();
    return extensions.indexOf(extension) !== -1;
  }

  private static loadPhotoMetadata(fullPath: string): Promise<PhotoMetadata> {
    return new Promise<PhotoMetadata>((resolve, reject) => {
      fs.readFile(fullPath, (err, data) => {
          if (err) {
            return reject({file: fullPath, error: err});
          }
          const metadata: PhotoMetadata = <PhotoMetadata>{
            keywords: [],
            cameraData: {},
            positionData: null,
            size: {},
            creationDate: 0,
            fileSize: 0
          };

          try {

            try {
              const stat = fs.statSync(fullPath);
              metadata.fileSize = stat.size;
            } catch (err) {
            }

            try {
              const exif = exif_parser.create(data).parse();
              metadata.cameraData = <CameraMetadata> {
                ISO: exif.tags.ISO,
                model: exif.tags.Model,
                make: exif.tags.Make,
                fStop: exif.tags.FNumber,
                exposure: exif.tags.ExposureTime,
                focalLength: exif.tags.FocalLength,
                lens: exif.tags.LensModel,
              };
              if (!isNaN(exif.tags.GPSLatitude) || exif.tags.GPSLongitude || exif.tags.GPSAltitude) {
                metadata.positionData = metadata.positionData || {};
                metadata.positionData.GPSData = <GPSMetadata> {
                  latitude: exif.tags.GPSLatitude,
                  longitude: exif.tags.GPSLongitude,
                  altitude: exif.tags.GPSAltitude
                };
              }

              if (exif.tags.CreateDate || exif.tags.DateTimeOriginal || exif.tags.ModifyDate) {
                metadata.creationDate = exif.tags.CreateDate || exif.tags.DateTimeOriginal || exif.tags.ModifyDate;
              }


              if (exif.imageSize) {
                metadata.size = <ImageSize> {width: exif.imageSize.width, height: exif.imageSize.height};
              } else if (exif.tags.RelatedImageWidth && exif.tags.RelatedImageHeight) {
                metadata.size = <ImageSize> {width: exif.tags.RelatedImageWidth, height: exif.tags.RelatedImageHeight};
              } else {
                metadata.size = <ImageSize> {width: 1, height: 1};
              }
            } catch (err) {
              Logger.debug(LOG_TAG, "Error parsing exif", fullPath, err);
              metadata.size = <ImageSize> {width: 1, height: 1};
            }

            try {
              const iptcData = IptcParser.parse(data);
              if (iptcData.country_or_primary_location_name || iptcData.province_or_state || iptcData.city) {
                metadata.positionData = metadata.positionData || {};
                metadata.positionData.country = iptcData.country_or_primary_location_name;
                metadata.positionData.state = iptcData.province_or_state;
                metadata.positionData.city = iptcData.city;
              }
              metadata.keywords = <string[]> (iptcData.keywords || []);
              metadata.creationDate = <number> (iptcData.date_time ? iptcData.date_time.getTime() : metadata.creationDate);

            } catch (err) {
              Logger.debug(LOG_TAG, "Error parsing iptc data", fullPath, err);
            }

            metadata.creationDate = metadata.creationDate || 0;

            return resolve(metadata);
          } catch (err) {
            return reject({file: fullPath, error: err});
          }
        });
      }
    );
  }

  public static  scanDirectory(relativeDirectoryName: string, maxPhotos: number = null, photosOnly: boolean = false): Promise<DirectoryDTO> {
    return new Promise<DirectoryDTO>((resolve, reject) => {

      const directoryName = path.basename(relativeDirectoryName);
      const directoryParent = path.join(path.dirname(relativeDirectoryName), path.sep);
      const absoluteDirectoryName = path.join(ProjectPath.ImageFolder, relativeDirectoryName);

      const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
      let directory = <DirectoryDTO>{
        name: directoryName,
        path: directoryParent,
        lastUpdate: Math.max(stat.ctime.getTime(), stat.mtime.getTime()),
        directories: [],
        photos: []
      };
      fs.readdir(absoluteDirectoryName, async (err, list) => {
        if (err) {
          return reject(err);
        }

        try {
          for (let i = 0; i < list.length; i++) {
            let file = list[i];
            let fullFilePath = path.normalize(path.resolve(absoluteDirectoryName, file));
            if (photosOnly == false && fs.statSync(fullFilePath).isDirectory()) {
              directory.directories.push(await DiskMangerWorker.scanDirectory(path.join(relativeDirectoryName, file),
                Config.Server.folderPreviewSize, true
              ));
            } else if (DiskMangerWorker.isImage(fullFilePath)) {
              directory.photos.push(<PhotoDTO>{
                name: file,
                directory: null,
                metadata: await DiskMangerWorker.loadPhotoMetadata(fullFilePath)
              });

              if (maxPhotos != null && directory.photos.length > maxPhotos) {
                break;
              }
            }
          }

          return resolve(directory);
        } catch (err) {
          return reject({error: err});
        }

      });
    });

  }
}
