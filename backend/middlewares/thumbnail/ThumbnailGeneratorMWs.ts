///<reference path="../customtypings/jimp.d.ts"/>
import * as path from "path";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../../common/entities/Error";
import {ContentWrapper} from "../../../common/entities/ConentWrapper";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {ProjectPath} from "../../ProjectPath";
import {PhotoDTO} from "../../../common/entities/PhotoDTO";
import {Config} from "../../../common/config/private/Config";
import {ThumbnailProcessingLib} from "../../../common/config/private/IPrivateConfig";
import {ThumbnailTH} from "../../model/threading/ThreadPool";
import {RendererFactory, RendererInput} from "../../model/threading/ThumbnailWoker";


export class ThumbnailGeneratorMWs {
  private static initDone = false;
  private static ThumbnailFunction: (input: RendererInput) => Promise<void> = null;
  private static threadPool: ThumbnailTH = null;

  public static init() {
    if (this.initDone == true) {
      return
    }


    if (Config.Server.enableThreading == true ||
      Config.Server.thumbnail.processingLibrary != ThumbnailProcessingLib.Jimp) {
      Config.Client.concurrentThumbnailGenerations = Math.max(1, os.cpus().length - 1);
    } else {
      Config.Client.concurrentThumbnailGenerations = 1;
    }

    this.ThumbnailFunction = RendererFactory.build(Config.Server.thumbnail.processingLibrary);

    if (Config.Server.enableThreading == true &&
      Config.Server.thumbnail.processingLibrary == ThumbnailProcessingLib.Jimp) {
      this.threadPool = new ThumbnailTH(Config.Client.concurrentThumbnailGenerations);
    }

    this.initDone = true;
  }

  private static addThInfoTODir(directory: DirectoryDTO) {
    if (typeof  directory.photos == "undefined") {
      directory.photos = [];
    }
    if (typeof  directory.directories == "undefined") {
      directory.directories = [];
    }
    ThumbnailGeneratorMWs.addThInfoToPhotos(directory.photos);

    for (let i = 0; i < directory.directories.length; i++) {
      ThumbnailGeneratorMWs.addThInfoTODir(directory.directories[i]);
    }

  }

  private static addThInfoToPhotos(photos: Array<PhotoDTO>) {
    let thumbnailFolder = ProjectPath.ThumbnailFolder;
    for (let i = 0; i < photos.length; i++) {
      let fullImagePath = path.join(ProjectPath.ImageFolder, photos[i].directory.path, photos[i].directory.name, photos[i].name);
      for (let j = 0; j < Config.Client.thumbnailSizes.length; j++) {
        let size = Config.Client.thumbnailSizes[j];
        let thPath = path.join(thumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(fullImagePath, size));
        if (fs.existsSync(thPath) === true) {
          if (typeof  photos[i].readyThumbnails == "undefined") {
            photos[i].readyThumbnails = [];
          }
          photos[i].readyThumbnails.push(size);
        }
      }
      let iconPath = path.join(thumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(fullImagePath, Config.Client.iconSize));
      if (fs.existsSync(iconPath) === true) {
        photos[i].readyIcon = true;
      }

    }
  }

  public static addThumbnailInformation(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe)
      return next();

    let cw: ContentWrapper = req.resultPipe;
    if (cw.directory) {
      ThumbnailGeneratorMWs.addThInfoTODir(cw.directory);
    }
    if (cw.searchResult) {
      ThumbnailGeneratorMWs.addThInfoToPhotos(cw.searchResult.photos);
    }


    return next();

  }

  public static generateThumbnail(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe)
      return next();

    //load parameters
    let imagePath = req.resultPipe;
    let size: number = parseInt(req.params.size) || Config.Client.thumbnailSizes[0];

    //validate size
    if (Config.Client.thumbnailSizes.indexOf(size) === -1) {
      size = Config.Client.thumbnailSizes[0];
    }

    ThumbnailGeneratorMWs.generateImage(imagePath, size, false, req, res, next);


  }

  public static generateIcon(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe)
      return next();

    //load parameters
    let imagePath = req.resultPipe;
    let size: number = Config.Client.iconSize;
    ThumbnailGeneratorMWs.generateImage(imagePath, size, true, req, res, next);


  }


  private static async generateImage(imagePath: string, size: number, makeSquare: boolean, req: Request, res: Response, next: NextFunction) {
    //generate thumbnail path
    let thPath = path.join(ProjectPath.ThumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(imagePath, size));


    req.resultPipe = thPath;

    //check if thumbnail already exist
    if (fs.existsSync(thPath) === true) {
      return next();
    }

    //create thumbnail folder if not exist
    if (!fs.existsSync(ProjectPath.ThumbnailFolder)) {
      fs.mkdirSync(ProjectPath.ThumbnailFolder);
    }

    //run on other thread
    let input = <RendererInput>{
      imagePath: imagePath,
      size: size,
      thPath: thPath,
      makeSquare: makeSquare,
      qualityPriority: Config.Server.thumbnail.qualityPriority
    };
    try {
      if (this.threadPool !== null) {
        await this.threadPool.execute(input);
        return next();
      } else {
        await ThumbnailGeneratorMWs.ThumbnailFunction(input);
        return next();
      }
    } catch (error) {
      console.log(error);
      return next(new Error(ErrorCodes.THUMBNAIL_GENERATION_ERROR, error));
    }
  }

  private static generateThumbnailName(imagePath: string, size: number): string {
    return crypto.createHash('md5').update(imagePath).digest('hex') + "_" + size + ".jpg";
  }
}

