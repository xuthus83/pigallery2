import {NextFunction, Request, Response} from 'express';
import * as fs from 'fs';
import {PhotoProcessing} from '../../model/fileprocessing/PhotoProcessing';
import {Config} from '../../../common/config/private/Config';

export class PhotoConverterMWs {

  public static async convertPhoto(req: Request, res: Response, next: NextFunction) {
    if (!(req.resultPipe || Config.Server.Media.Photo.converting.enabled === false)) {
      return next();
    }
    const fullMediaPath = req.resultPipe;

    const convertedVideo = PhotoProcessing.generateConvertedFileName(fullMediaPath);

    // check if transcoded video exist
    if (fs.existsSync(convertedVideo) === true) {
      req.resultPipe = convertedVideo;
      return next();
    }

    if (Config.Server.Media.Photo.converting.onTheFly) {
      req.resultPipe = await PhotoProcessing.convertPhoto(fullMediaPath,
        Config.Server.Media.Photo.converting.resolution);
    }

    return next();
  }
}

