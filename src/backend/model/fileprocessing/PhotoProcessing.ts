import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ThumbnailTH} from '../threading/ThreadPool';
import {RendererInput, ThumbnailSourceType, ThumbnailWorker} from '../threading/ThumbnailWorker';
import {ITaskExecuter, TaskExecuter} from '../threading/TaskExecuter';
import {ServerConfig} from '../../../common/config/private/IPrivateConfig';
import {FaceRegion, PhotoDTO} from '../../../common/entities/PhotoDTO';


export class PhotoProcessing {

  private static initDone = false;
  private static taskQue: ITaskExecuter<RendererInput, void> = null;

  public static init() {
    if (this.initDone === true) {
      return;
    }


    if (Config.Server.Threading.enable === true) {
      if (Config.Server.Threading.thumbnailThreads > 0) {
        Config.Client.Media.Thumbnail.concurrentThumbnailGenerations = Config.Server.Threading.thumbnailThreads;
      } else {
        Config.Client.Media.Thumbnail.concurrentThumbnailGenerations = Math.max(1, os.cpus().length - 1);
      }
    } else {
      Config.Client.Media.Thumbnail.concurrentThumbnailGenerations = 1;
    }

    if (Config.Server.Threading.enable === true &&
      Config.Server.Media.Thumbnail.processingLibrary === ServerConfig.ThumbnailProcessingLib.Jimp) {
      this.taskQue = new ThumbnailTH(Config.Client.Media.Thumbnail.concurrentThumbnailGenerations);
    } else {
      this.taskQue = new TaskExecuter(Config.Client.Media.Thumbnail.concurrentThumbnailGenerations,
        (input => ThumbnailWorker.render(input, Config.Server.Media.Thumbnail.processingLibrary)));
    }

    this.initDone = true;
  }


  public static async generatePersonThumbnail(photo: PhotoDTO) {

    // load parameters

    if (!photo.metadata.faces || photo.metadata.faces.length !== 1) {
      throw new Error('Photo does not contain  a face');
    }

    // load parameters
    const mediaPath = path.join(ProjectPath.ImageFolder, photo.directory.path, photo.directory.name, photo.name);
    const size: number = Config.Client.Media.Thumbnail.personThumbnailSize;
    // generate thumbnail path
    const thPath = path.join(ProjectPath.ThumbnailFolder,
      PhotoProcessing.generatePersonThumbnailName(mediaPath, photo.metadata.faces[0], size));


    // check if thumbnail already exist
    if (fs.existsSync(thPath) === true) {
      return null;
    }


    const margin = {
      x: Math.round(photo.metadata.faces[0].box.width * (Config.Server.Media.Thumbnail.personFaceMargin)),
      y: Math.round(photo.metadata.faces[0].box.height * (Config.Server.Media.Thumbnail.personFaceMargin))
    };


    // run on other thread
    const input = <RendererInput>{
      type: ThumbnailSourceType.Photo,
      mediaPath: mediaPath,
      size: size,
      outPath: thPath,
      makeSquare: false,
      cut: {
        left: Math.round(Math.max(0, photo.metadata.faces[0].box.left - margin.x / 2)),
        top: Math.round(Math.max(0, photo.metadata.faces[0].box.top - margin.y / 2)),
        width: photo.metadata.faces[0].box.width + margin.x,
        height: photo.metadata.faces[0].box.height + margin.y
      },
      qualityPriority: Config.Server.Media.Thumbnail.qualityPriority
    };
    input.cut.width = Math.min(input.cut.width, photo.metadata.size.width - input.cut.left);
    input.cut.height = Math.min(input.cut.height, photo.metadata.size.height - input.cut.top);

    await PhotoProcessing.taskQue.execute(input);
    return thPath;
  }


  public static generateThumbnailName(mediaPath: string, size: number): string {
    return crypto.createHash('md5').update(mediaPath).digest('hex') + '_' + size + '.jpg';
  }

  public static generatePersonThumbnailName(mediaPath: string, faceRegion: FaceRegion, size: number): string {
    return crypto.createHash('md5').update(mediaPath + '_' + faceRegion.name + '_' + faceRegion.box.left + '_' + faceRegion.box.top)
      .digest('hex') + '_' + size + '.jpg';
  }


  public static generateConvertedFileName(photoPath: string): string {
    const extension = path.extname(photoPath);
    const file = path.basename(photoPath, extension);
    const postfix = Config.Server.Media.Photo.converting.resolution;
    return path.join(ProjectPath.TranscodedFolder,
      ProjectPath.getRelativePathToImages(path.dirname(photoPath)), file +
      '_' + postfix + '.jpg');
  }


  public static async convertPhoto(mediaPath: string, size: number) {
    // generate thumbnail path
    const outPath = PhotoProcessing.generateConvertedFileName(mediaPath);


    // check if file already exist
    if (fs.existsSync(outPath) === true) {
      return outPath;
    }


    // run on other thread
    const input = <RendererInput>{
      type: ThumbnailSourceType.Photo,
      mediaPath: mediaPath,
      size: size,
      outPath: outPath,
      makeSquare: false,
      qualityPriority: Config.Server.Media.Thumbnail.qualityPriority
    };

    const outDir = path.dirname(input.outPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, {recursive: true});
    }
    await this.taskQue.execute(input);
    return outPath;
  }

  public static async generateThumbnail(mediaPath: string,
                                        size: number,
                                        sourceType: ThumbnailSourceType,
                                        makeSquare: boolean) {
    // generate thumbnail path
    const outPath = path.join(ProjectPath.ThumbnailFolder, PhotoProcessing.generateThumbnailName(mediaPath, size));


    // check if thumbnail already exist
    if (fs.existsSync(outPath) === true) {
      return outPath;
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
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, {recursive: true});
    }
    await this.taskQue.execute(input);
    return outPath;
  }
}

