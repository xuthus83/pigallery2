import * as path from 'path';
import {constants as fsConstants, promises as fsp} from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ThumbnailTH} from '../threading/ThreadPool';
import {PhotoWorker, RendererInput, ThumbnailSourceType} from '../threading/PhotoWorker';
import {ITaskExecuter, TaskExecuter} from '../threading/TaskExecuter';
import {FaceRegion, PhotoDTO} from '../../../common/entities/PhotoDTO';
import {SupportedFormats} from '../../../common/SupportedFormats';
import {ServerConfig} from '../../../common/config/private/PrivateConfig';
import {PersonWithSampleRegion} from '../../../common/entities/PersonDTO';


export class PhotoProcessing {

  private static initDone = false;
  private static taskQue: ITaskExecuter<RendererInput, void> = null;

  public static init() {
    if (this.initDone === true) {
      return;
    }


    if (Config.Server.Threading.enabled === true) {
      if (Config.Server.Threading.thumbnailThreads > 0) {
        Config.Client.Media.Thumbnail.concurrentThumbnailGenerations = Config.Server.Threading.thumbnailThreads;
      } else {
        Config.Client.Media.Thumbnail.concurrentThumbnailGenerations = Math.max(1, os.cpus().length - 1);
      }
    } else {
      Config.Client.Media.Thumbnail.concurrentThumbnailGenerations = 1;
    }

    if (Config.Server.Threading.enabled === true &&
      Config.Server.Media.photoProcessingLibrary === ServerConfig.PhotoProcessingLib.Jimp) {
      this.taskQue = new ThumbnailTH(Config.Client.Media.Thumbnail.concurrentThumbnailGenerations);
    } else {
      this.taskQue = new TaskExecuter(Config.Client.Media.Thumbnail.concurrentThumbnailGenerations,
        (input => PhotoWorker.render(input, Config.Server.Media.photoProcessingLibrary)));
    }

    this.initDone = true;
  }


  public static async generatePersonThumbnail(person: PersonWithSampleRegion) {

    // load parameters
    const photo: PhotoDTO = person.sampleRegion.media;
    const mediaPath = path.join(ProjectPath.ImageFolder, photo.directory.path, photo.directory.name, photo.name);
    const size: number = Config.Client.Media.Thumbnail.personThumbnailSize;
    // generate thumbnail path
    const thPath = PhotoProcessing.generatePersonThumbnailPath(mediaPath, person.sampleRegion, size);


    // check if thumbnail already exist
    try {
      await fsp.access(thPath, fsConstants.R_OK);
      return thPath;
    } catch (e) {
    }


    const margin = {
      x: Math.round(person.sampleRegion.box.width * (Config.Server.Media.Thumbnail.personFaceMargin)),
      y: Math.round(person.sampleRegion.box.height * (Config.Server.Media.Thumbnail.personFaceMargin))
    };


    // run on other thread
    const input = <RendererInput>{
      type: ThumbnailSourceType.Photo,
      mediaPath: mediaPath,
      size: size,
      outPath: thPath,
      makeSquare: false,
      cut: {
        left: Math.round(Math.max(0, person.sampleRegion.box.left - margin.x / 2)),
        top: Math.round(Math.max(0, person.sampleRegion.box.top - margin.y / 2)),
        width: person.sampleRegion.box.width + margin.x,
        height: person.sampleRegion.box.height + margin.y
      },
      qualityPriority: Config.Server.Media.Thumbnail.qualityPriority
    };
    input.cut.width = Math.min(input.cut.width, photo.metadata.size.width - input.cut.left);
    input.cut.height = Math.min(input.cut.height, photo.metadata.size.height - input.cut.top);

    await fsp.mkdir(ProjectPath.FacesFolder, {recursive: true});
    await PhotoProcessing.taskQue.execute(input);
    return thPath;
  }


  public static generateConvertedPath(mediaPath: string, size: number): string {
    const file = path.basename(mediaPath);
    return path.join(ProjectPath.TranscodedFolder,
      ProjectPath.getRelativePathToImages(path.dirname(mediaPath)),
      file + '_' + size + '.jpg');
  }

  public static generatePersonThumbnailPath(mediaPath: string, faceRegion: FaceRegion, size: number): string {
    return path.join(ProjectPath.FacesFolder,
      crypto.createHash('md5').update(mediaPath + '_' + faceRegion.name + '_' + faceRegion.box.left + '_' + faceRegion.box.top)
        .digest('hex') + '_' + size + '.jpg');
  }


  public static async isValidConvertedPath(convertedPath: string): Promise<boolean> {
    const origFilePath = path.join(ProjectPath.ImageFolder,
      path.relative(ProjectPath.TranscodedFolder,
        convertedPath.substring(0, convertedPath.lastIndexOf('_'))));

    const sizeStr = convertedPath.substring(convertedPath.lastIndexOf('_') + 1,
      convertedPath.length - path.extname(convertedPath).length);

    const size = parseInt(sizeStr, 10);

    if ((size + '').length !== sizeStr.length ||
      (Config.Client.Media.Thumbnail.thumbnailSizes.indexOf(size) === -1 &&
        Config.Server.Media.Photo.Converting.resolution !== size)) {
      return false;
    }

    try {
      await fsp.access(origFilePath, fsConstants.R_OK);
    } catch (e) {
      return false;
    }


    return true;
  }


  public static async convertPhoto(mediaPath: string) {
    return this.generateThumbnail(mediaPath,
      Config.Server.Media.Photo.Converting.resolution,
      ThumbnailSourceType.Photo,
      false);
  }


  static async convertedPhotoExist(mediaPath: string, size: number) {

    // generate thumbnail path
    const outPath = PhotoProcessing.generateConvertedPath(mediaPath, size);


    // check if file already exist
    try {
      await fsp.access(outPath, fsConstants.R_OK);
      return true;
    } catch (e) {
    }
    return false;
  }

  public static async generateThumbnail(mediaPath: string,
                                        size: number,
                                        sourceType: ThumbnailSourceType,
                                        makeSquare: boolean): Promise<string> {
    // generate thumbnail path
    const outPath = PhotoProcessing.generateConvertedPath(mediaPath, size);


    // check if file already exist
    try {
      await fsp.access(outPath, fsConstants.R_OK);
      return outPath;
    } catch (e) {
    }


    // run on other thread
    const input = <RendererInput>{
      type: sourceType,
      mediaPath: mediaPath,
      size: size,
      outPath: outPath,
      makeSquare: makeSquare,
      qualityPriority: Config.Server.Media.Thumbnail.qualityPriority
    };

    const outDir = path.dirname(input.outPath);

    await fsp.mkdir(outDir, {recursive: true});
    await this.taskQue.execute(input);
    return outPath;
  }

  public static isPhoto(fullPath: string) {
    const extension = path.extname(fullPath).toLowerCase();
    return SupportedFormats.WithDots.Photos.indexOf(extension) !== -1;
  }

}

