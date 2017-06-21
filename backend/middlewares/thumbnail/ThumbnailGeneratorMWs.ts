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
import {ThumbnailRenderers} from "./THRenderers";
import {Config} from "../../../common/config/private/Config";
import {ThumbnailProcessingLib} from "../../../common/config/private/IPrivateConfig";
import RendererInput = ThumbnailRenderers.RendererInput;


export class ThumbnailGeneratorMWs {
  private static initDone = false;
  private static ThumbnailFunction = null;
  private static thPool = null;

  public static init() {
    if (this.initDone == true) {
      return
    }

    Config.Client.concurrentThumbnailGenerations = Math.max(1, os.cpus().length - 1);


    switch (Config.Server.thumbnail.processingLibrary) {
      case ThumbnailProcessingLib.Jimp:
        this.ThumbnailFunction = ThumbnailRenderers.jimp;
        break;
      case ThumbnailProcessingLib.gm:
        this.ThumbnailFunction = ThumbnailRenderers.gm;
        break;
      case ThumbnailProcessingLib.sharp:
        this.ThumbnailFunction = ThumbnailRenderers.sharp;

        break;
      default:
        throw "Unknown thumbnail processing lib";
    }

    if (Config.Server.enableThreading == true &&
      Config.Server.thumbnail.processingLibrary == ThumbnailProcessingLib.Jimp) {
      const Pool = require('threads').Pool;
      this.thPool = new Pool(Config.Client.concurrentThumbnailGenerations);
      this.thPool.run(this.ThumbnailFunction);
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


  private static generateImage(imagePath: string, size: number, makeSquare: boolean, req: Request, res: Response, next: NextFunction) {

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
      qualityPriority: Config.Server.thumbnail.qualityPriority,
      __dirname: __dirname,
    };
    if (this.thPool !== null) {
      this.thPool.send(input)
        .on('done', (out) => {
          return next(out);
        }).on('error', (error) => {
        console.log(error);
        return next(new Error(ErrorCodes.THUMBNAIL_GENERATION_ERROR, error));
      });
    } else {
      try {
        ThumbnailGeneratorMWs.ThumbnailFunction(input, out => next(out));
      } catch (error) {
        console.log(error);
        return next(new Error(ErrorCodes.THUMBNAIL_GENERATION_ERROR, error));
      }
    }
  }

  private static generateThumbnailName(imagePath: string, size: number): string {
    return crypto.createHash('md5').update(imagePath).digest('hex') + "_" + size + ".jpg";
  }
}

ThumbnailGeneratorMWs.init();
