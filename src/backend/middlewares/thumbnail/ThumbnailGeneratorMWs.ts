import * as path from 'path';
import * as fs from 'fs';
import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../../common/entities/Error';
import {ContentWrapper} from '../../../common/entities/ConentWrapper';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ThumbnailSourceType} from '../../model/threading/PhotoWorker';
import {MediaBaseDTO, MediaDTO} from '../../../common/entities/MediaDTO';
import {PhotoProcessing} from '../../model/fileprocessing/PhotoProcessing';
import {PersonWithSampleRegion} from '../../../common/entities/PersonDTO';


export class ThumbnailGeneratorMWs {
  public static async addThumbnailInformation(req: Request, res: Response, next: NextFunction) {
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
      console.error(error);
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

      const persons: PersonWithSampleRegion[] = req.resultPipe;
      for (let i = 0; i < persons.length; i++) {
        // load parameters
        const mediaPath = path.join(ProjectPath.ImageFolder,
          persons[i].sampleRegion.media.directory.path,
          persons[i].sampleRegion.media.directory.name, persons[i].sampleRegion.media.name);

        // generate thumbnail path
        const thPath = PhotoProcessing.generatePersonThumbnailPath(mediaPath, persons[i].sampleRegion, size);

        persons[i].readyThumbnail = fs.existsSync(thPath);
      }

    } catch (error) {
      return next(new ErrorDTO(ErrorCodes.SERVER_ERROR, 'error during postprocessing result (adding thumbnail info for persons)',
        error.toString()));

    }

    return next();

  }


  public static async generatePersonThumbnail(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }
    const person: PersonWithSampleRegion = req.resultPipe;
    try {
      req.resultPipe = await PhotoProcessing.generatePersonThumbnail(person);
      return next();
    } catch (error) {
      console.error(error);
      return next(new ErrorDTO(ErrorCodes.THUMBNAIL_GENERATION_ERROR,
        'Error during generating face thumbnail: ' + person.name, error.toString()));
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
    if (directory.preview) {
       ThumbnailGeneratorMWs.addThInfoToAPhoto(directory.preview);
    }
    if (typeof directory.directories !== 'undefined') {
      for (let i = 0; i < directory.directories.length; i++) {
        ThumbnailGeneratorMWs.addThInfoTODir(directory.directories[i]);
      }
    }
  }

  private static addThInfoToPhotos(photos: MediaDTO[]) {
    for (let i = 0; i < photos.length; i++) {
      this.addThInfoToAPhoto(photos[i]);
    }
  }

  private static addThInfoToAPhoto(photo: MediaBaseDTO) {
    const fullMediaPath = path.join(ProjectPath.ImageFolder, photo.directory.path, photo.directory.name, photo.name);
    for (let j = 0; j < Config.Client.Media.Thumbnail.thumbnailSizes.length; j++) {
      const size = Config.Client.Media.Thumbnail.thumbnailSizes[j];
      const thPath = PhotoProcessing.generateConvertedPath(fullMediaPath, size);
      if (fs.existsSync(thPath) === true) {
        if (typeof photo.readyThumbnails === 'undefined') {
          photo.readyThumbnails = [];
        }
        photo.readyThumbnails.push(size);
      }
    }
    const iconPath = PhotoProcessing.generateConvertedPath(fullMediaPath, Config.Client.Media.Thumbnail.iconSize);
    if (fs.existsSync(iconPath) === true) {
      photo.readyIcon = true;
    }

  }

}

