import * as path from 'path';
import * as fs from 'fs';
import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../../common/entities/Error';
import {ContentWrapper} from '../../../common/entities/ConentWrapper';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ThumbnailSourceType} from '../../model/threading/PhotoWorker';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {PersonWithPhoto} from '../PersonMWs';
import {PhotoProcessing} from '../../model/fileprocessing/PhotoProcessing';


export class ThumbnailGeneratorMWs {
  public static addThumbnailInformation(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }

    try {
      const cw: ContentWrapper = req.resultPipe;
      if (cw.notModified === true) {
        return next();
      }
      if (cw.directory) {
        ThumbnailGeneratorMWs.addThInfoTODir(cw.directory);
      }
      if (cw.searchResult && cw.searchResult.media) {
        ThumbnailGeneratorMWs.addThInfoToPhotos(cw.searchResult.media);
      }

    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.SERVER_ERROR, 'error during postprocessing result (adding thumbnail info)', error.toString()));

    }

    return next();

  }


  public static addThumbnailInfoForPersons(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }

    try {
      const size: number = Config.Client.Media.Thumbnail.personThumbnailSize;

      const persons: PersonWithPhoto[] = req.resultPipe;
      for (let i = 0; i < persons.length; i++) {
        // load parameters
        const mediaPath = path.join(ProjectPath.ImageFolder,
          persons[i].samplePhoto.directory.path,
          persons[i].samplePhoto.directory.name, persons[i].samplePhoto.name);

        // generate thumbnail path
        const thPath = PhotoProcessing.generatePersonThumbnailPath(mediaPath, persons[i].samplePhoto.metadata.faces[0], size);

        persons[i].readyThumbnail = fs.existsSync(thPath);
      }

    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.SERVER_ERROR, 'error during postprocessing result (adding thumbnail info)', error.toString()));

    }

    return next();

  }


  public static async generatePersonThumbnail(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }
    try {
      req.resultPipe = await PhotoProcessing.generatePersonThumbnail(req.resultPipe);
      return next();
    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.THUMBNAIL_GENERATION_ERROR,
        'Error during generating face thumbnail: ' + req.resultPipe, error.toString()));
    }

  }


  public static generateThumbnailFactory(sourceType: ThumbnailSourceType) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.resultPipe) {
        return next();
      }

      // load parameters
      const mediaPath = req.resultPipe;
      let size: number = parseInt(req.params.size, 10) || Config.Client.Media.Thumbnail.thumbnailSizes[0];

      // validate size
      if (Config.Client.Media.Thumbnail.thumbnailSizes.indexOf(size) === -1) {
        size = Config.Client.Media.Thumbnail.thumbnailSizes[0];
      }


      try {
        req.resultPipe = await PhotoProcessing.generateThumbnail(mediaPath, size, sourceType, false);
        return next();
      } catch (error) {
        return next(new ErrorDTO(ErrorCodes.THUMBNAIL_GENERATION_ERROR,
          'Error during generating thumbnail: ' + mediaPath, error.toString()));
      }
    };
  }

  public static generateIconFactory(sourceType: ThumbnailSourceType) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.resultPipe) {
        return next();
      }

      // load parameters
      const mediaPath = req.resultPipe;
      const size: number = Config.Client.Media.Thumbnail.iconSize;

      try {
        req.resultPipe = await PhotoProcessing.generateThumbnail(mediaPath, size, sourceType, true);
        return next();
      } catch (error) {
        return next(new ErrorDTO(ErrorCodes.THUMBNAIL_GENERATION_ERROR,
          'Error during generating thumbnail: ' + mediaPath, error.toString()));
      }
    };
  }


  private static addThInfoTODir(directory: DirectoryDTO) {
    if (typeof directory.media !== 'undefined') {
      ThumbnailGeneratorMWs.addThInfoToPhotos(directory.media);
    }
    if (typeof directory.directories !== 'undefined') {
      for (let i = 0; i < directory.directories.length; i++) {
        ThumbnailGeneratorMWs.addThInfoTODir(directory.directories[i]);
      }
    }
  }

  private static addThInfoToPhotos(photos: MediaDTO[]) {
    for (let i = 0; i < photos.length; i++) {
      const fullMediaPath = path.join(ProjectPath.ImageFolder, photos[i].directory.path, photos[i].directory.name, photos[i].name);
      for (let j = 0; j < Config.Client.Media.Thumbnail.thumbnailSizes.length; j++) {
        const size = Config.Client.Media.Thumbnail.thumbnailSizes[j];
        const thPath = PhotoProcessing.generateConvertedPath(fullMediaPath, size);
        if (fs.existsSync(thPath) === true) {
          if (typeof photos[i].readyThumbnails === 'undefined') {
            photos[i].readyThumbnails = [];
          }
          photos[i].readyThumbnails.push(size);
        }
      }
      const iconPath = PhotoProcessing.generateConvertedPath(fullMediaPath, Config.Client.Media.Thumbnail.iconSize);
      if (fs.existsSync(iconPath) === true) {
        photos[i].readyIcon = true;
      }
    }
  }

}

