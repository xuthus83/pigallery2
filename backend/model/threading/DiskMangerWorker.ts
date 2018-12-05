import * as fs from 'fs';
import * as path from 'path';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {CameraMetadata, GPSMetadata, PhotoDTO, PhotoMetadata} from '../../../common/entities/PhotoDTO';
import {Logger} from '../../Logger';
import {IptcParser} from 'ts-node-iptc';
import {ExifParserFactory, OrientationTypes} from 'ts-exif-parser';
import {FfprobeData} from 'fluent-ffmpeg';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {VideoDTO, VideoMetadata} from '../../../common/entities/VideoDTO';
import {MediaDimension} from '../../../common/entities/MediaDTO';
import {FFmpegFactory} from '../FFmpegFactory';
import {FileDTO} from '../../../common/entities/FileDTO';

const LOG_TAG = '[DiskManagerTask]';

const ffmpeg = FFmpegFactory.get();

export class DiskMangerWorker {

  private static readonly SupportedEXT = {
    photo: [
      '.bmp',
      '.gif',
      '.jpeg', '.jpg', '.jpe',
      '.png',
      '.tiff', '.tif',
      '.webp',
      '.ico',
      '.tga'
    ],
    video: [
      '.mp4',
      '.webm',
      '.ogv',
      '.ogg'
    ],
    metaFile: [
      '.gpx'
    ]
  };

  private static isImage(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return this.SupportedEXT.photo.indexOf(extension) !== -1;
  }

  private static isVideo(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return this.SupportedEXT.video.indexOf(extension) !== -1;
  }

  private static isMetaFile(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return this.SupportedEXT.metaFile.indexOf(extension) !== -1;
  }

  public static scanDirectory(relativeDirectoryName: string, maxPhotos: number = null, photosOnly: boolean = false): Promise<DirectoryDTO> {
    return new Promise<DirectoryDTO>((resolve, reject) => {
      const directoryName = path.basename(relativeDirectoryName);
      const directoryParent = path.join(path.dirname(relativeDirectoryName), path.sep);
      const absoluteDirectoryName = path.join(ProjectPath.ImageFolder, relativeDirectoryName);

      const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
      const directory: DirectoryDTO = {
        id: null,
        parent: null,
        name: directoryName,
        path: directoryParent,
        lastModified: Math.max(stat.ctime.getTime(), stat.mtime.getTime()),
        lastScanned: Date.now(),
        directories: [],
        isPartial: false,
        media: [],
        metaFile: []
      };
      fs.readdir(absoluteDirectoryName, async (err, list: string[]) => {
        if (err) {
          return reject(err);
        }

        try {
          for (let i = 0; i < list.length; i++) {
            const file = list[i];
            const fullFilePath = path.normalize(path.resolve(absoluteDirectoryName, file));
            if (fs.statSync(fullFilePath).isDirectory()) {
              if (photosOnly === true) {
                continue;
              }
              const d = await DiskMangerWorker.scanDirectory(path.join(relativeDirectoryName, file),
                Config.Server.indexing.folderPreviewSize, true
              );
              d.lastScanned = 0; // it was not a fully scan
              d.isPartial = true;
              directory.directories.push(d);
            } else if (DiskMangerWorker.isImage(fullFilePath)) {
              directory.media.push(<PhotoDTO>{
                name: file,
                directory: null,
                metadata: await DiskMangerWorker.loadPhotoMetadata(fullFilePath)
              });

              if (maxPhotos != null && directory.media.length > maxPhotos) {
                break;
              }
            } else if (photosOnly === false && Config.Client.Video.enabled === true &&
              DiskMangerWorker.isVideo(fullFilePath)) {
              directory.media.push(<VideoDTO>{
                name: file,
                directory: null,
                metadata: await DiskMangerWorker.loadVideoMetadata(fullFilePath)
              });

            } else if (photosOnly === false && Config.Client.MetaFile.enabled === true &&
              DiskMangerWorker.isMetaFile(fullFilePath)) {
              directory.metaFile.push(<FileDTO>{
                name: file,
                directory: null,
              });

            }
          }

          return resolve(directory);
        } catch (err) {
          return reject({error: err.toString()});
        }

      });
    });

  }

  public static loadVideoMetadata(fullPath: string): Promise<VideoMetadata> {
    return new Promise<VideoMetadata>((resolve, reject) => {
      const metadata: VideoMetadata = {
        size: {
          width: 1,
          height: 1
        },
        bitRate: 0,
        duration: 0,
        creationDate: 0,
        fileSize: 0
      };
      try {
        const stat = fs.statSync(fullPath);
        metadata.fileSize = stat.size;
      } catch (err) {
      }
      ffmpeg(fullPath).ffprobe((err: any, data: FfprobeData) => {
        if (!!err || data === null) {
          return reject(err);
        }

        if (!data.streams[0]) {
          return resolve(metadata);
        }

        try {
          for (let i = 0; i < data.streams.length; i++) {
            if (data.streams[i].width) {
              metadata.size.width = data.streams[i].width;
              metadata.size.height = data.streams[i].height;

              metadata.duration = Math.floor(data.streams[i].duration * 1000);
              metadata.bitRate = parseInt(data.streams[i].bit_rate, 10) || null;
              metadata.creationDate = Date.parse(data.streams[i].tags.creation_time);
              break;
            }
          }

        } catch (err) {
        }

        return resolve(metadata);
      });
    });
  }

  public static loadPhotoMetadata(fullPath: string): Promise<PhotoMetadata> {
    return new Promise<PhotoMetadata>((resolve, reject) => {
        const fd = fs.openSync(fullPath, 'r');

        const data = Buffer.allocUnsafe(Config.Server.photoMetadataSize);
        fs.read(fd, data, 0, Config.Server.photoMetadataSize, 0, (err) => {
          if (err) {
            fs.closeSync(fd);
            return reject({file: fullPath, error: err});
          }
          const metadata: PhotoMetadata = {
            keywords: [],
            cameraData: {},
            positionData: null,
            size: {width: 1, height: 1},
            caption: null,
            orientation: OrientationTypes.TOP_LEFT,
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
              const exif = ExifParserFactory.create(data).parse();
              metadata.cameraData = <CameraMetadata>{
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
                metadata.positionData.GPSData = <GPSMetadata>{
                  latitude: exif.tags.GPSLatitude,
                  longitude: exif.tags.GPSLongitude,
                  altitude: exif.tags.GPSAltitude
                };
              }

              if (exif.tags.CreateDate || exif.tags.DateTimeOriginal || exif.tags.ModifyDate) {
                metadata.creationDate = exif.tags.CreateDate || exif.tags.DateTimeOriginal || exif.tags.ModifyDate;
              }

              if (exif.tags.Orientation) {
                metadata.orientation = exif.tags.Orientation;
              }

              if (exif.imageSize) {
                metadata.size = <MediaDimension>{width: exif.imageSize.width, height: exif.imageSize.height};
              } else if (exif.tags.RelatedImageWidth && exif.tags.RelatedImageHeight) {
                metadata.size = <MediaDimension>{width: exif.tags.RelatedImageWidth, height: exif.tags.RelatedImageHeight};
              } else {
                metadata.size = <MediaDimension>{width: 1, height: 1};
              }
            } catch (err) {
              Logger.debug(LOG_TAG, 'Error parsing exif', fullPath, err);
              metadata.size = <MediaDimension>{width: 1, height: 1};
            }

            try {
              const iptcData = IptcParser.parse(data);
              if (iptcData.country_or_primary_location_name || iptcData.province_or_state || iptcData.city) {
                metadata.positionData = metadata.positionData || {};
                metadata.positionData.country = iptcData.country_or_primary_location_name;
                metadata.positionData.state = iptcData.province_or_state;
                metadata.positionData.city = iptcData.city;
              }
              metadata.caption = iptcData.caption;
              metadata.keywords = iptcData.keywords || [];
              metadata.creationDate = <number>(iptcData.date_time ? iptcData.date_time.getTime() : metadata.creationDate);

            } catch (err) {
              //  Logger.debug(LOG_TAG, 'Error parsing iptc data', fullPath, err);
            }

            metadata.creationDate = metadata.creationDate || 0;

            fs.closeSync(fd);
            return resolve(metadata);
          } catch (err) {
            fs.closeSync(fd);
            return reject({file: fullPath, error: err});
          }
        });
      }
    );
  }
}
