import * as path from 'path';
import {promises as fsp} from 'fs';
import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {DirectoryDTO} from '../../common/entities/DirectoryDTO';
import {ObjectManagers} from '../model/ObjectManagers';
import {ContentWrapper} from '../../common/entities/ConentWrapper';
import {PhotoDTO} from '../../common/entities/PhotoDTO';
import {ProjectPath} from '../ProjectPath';
import {Config} from '../../common/config/private/Config';
import {UserDTO} from '../../common/entities/UserDTO';
import {MediaDTO} from '../../common/entities/MediaDTO';
import {VideoDTO} from '../../common/entities/VideoDTO';
import {Utils} from '../../common/Utils';
import {QueryParams} from '../../common/QueryParams';
import {VideoProcessing} from '../model/fileprocessing/VideoProcessing';
import {SearchQueryDTO, SearchQueryTypes} from '../../common/entities/SearchQueryDTO';
import {LocationLookupException} from '../exceptions/LocationLookupException';


export class GalleryMWs {


  public static async listDirectory(req: Request, res: Response, next: NextFunction) {
    const directoryName = req.params.directory || '/';
    const absoluteDirectoryName = path.join(ProjectPath.ImageFolder, directoryName);
    try {
      if ((await fsp.stat(absoluteDirectoryName)).isDirectory() === false) {
        return next();
      }
    } catch (e) {
      return next();
    }

    try {
      const directory = await ObjectManagers.getInstance()
        .GalleryManager.listDirectory(directoryName,
          parseInt(<string>req.query[QueryParams.gallery.knownLastModified], 10),
          parseInt(<string>req.query[QueryParams.gallery.knownLastScanned], 10));

      if (directory == null) {
        req.resultPipe = new ContentWrapper(null, null, true);
        return next();
      }
      if (req.session.user.permissions &&
        req.session.user.permissions.length > 0 &&
        req.session.user.permissions[0] !== '/*') {
        (<DirectoryDTO>directory).directories = (<DirectoryDTO>directory).directories.filter(d =>
          UserDTO.isDirectoryAvailable(d, req.session.user.permissions));
      }
      req.resultPipe = new ContentWrapper(directory, null);
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during listing the directory', err));
    }
  }


  public static cleanUpGalleryResults(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }

    const cw: ContentWrapper = req.resultPipe;
    if (cw.notModified === true) {
      return next();
    }

    const cleanUpMedia = (media: MediaDTO[]) => {
      media.forEach(m => {
        if (MediaDTO.isPhoto(m)) {
          delete (<VideoDTO>m).metadata.bitRate;
          delete (<VideoDTO>m).metadata.duration;
        } else if (MediaDTO.isVideo(m)) {
          delete (<PhotoDTO>m).metadata.rating;
          delete (<PhotoDTO>m).metadata.caption;
          delete (<PhotoDTO>m).metadata.cameraData;
          delete (<PhotoDTO>m).metadata.orientation;
          delete (<PhotoDTO>m).metadata.orientation;
          delete (<PhotoDTO>m).metadata.keywords;
          delete (<PhotoDTO>m).metadata.positionData;
        }
        Utils.removeNullOrEmptyObj(m);
      });
    };

    if (cw.directory) {
      DirectoryDTO.packDirectory(cw.directory);
      // TODO: remove when typeorm inheritance is fixed (and handles proper inheritance)
      cleanUpMedia(cw.directory.media);
    }
    if (cw.searchResult) {
      cleanUpMedia(cw.searchResult.media);
    }


    if (Config.Client.Media.Video.enabled === false) {
      if (cw.directory) {
        const removeVideos = (dir: DirectoryDTO) => {
          dir.media = dir.media.filter(m => !MediaDTO.isVideo(m));
          if (dir.directories) {
            dir.directories.forEach(d => removeVideos(d));
          }
        };
        removeVideos(cw.directory);
      }
      if (cw.searchResult) {
        cw.searchResult.media = cw.searchResult.media.filter(m => !MediaDTO.isVideo(m));
      }
    }

    return next();
  }


  public static async loadFile(req: Request, res: Response, next: NextFunction) {
    if (!(req.params.mediaPath)) {
      return next();
    }
    const fullMediaPath = path.join(ProjectPath.ImageFolder, req.params.mediaPath);

    // check if file exist
    try {
      if ((await fsp.stat(fullMediaPath)).isDirectory()) {
        return next();
      }
    } catch (e) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'no such file:' + req.params.mediaPath, 'can\'t find file: ' + fullMediaPath));
    }


    req.resultPipe = fullMediaPath;
    return next();
  }

  public static async loadBestFitVideo(req: Request, res: Response, next: NextFunction) {
    if (!(req.resultPipe)) {
      return next();
    }
    const fullMediaPath: string = req.resultPipe;

    const convertedVideo = VideoProcessing.generateConvertedFilePath(fullMediaPath);

    // check if transcoded video exist
    try {
      await fsp.access(convertedVideo);
      req.resultPipe = convertedVideo;
    } catch (e) {
    }


    return next();
  }


  public static async search(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.Search.enabled === false || !(req.params.searchQueryDTO)) {
      return next();
    }

    const query: SearchQueryDTO = JSON.parse(<any>req.params.searchQueryDTO);

    try {
      const result = await ObjectManagers.getInstance().SearchManager.search(query);

      result.directories.forEach(dir => dir.media = dir.media || []);
      req.resultPipe = new ContentWrapper(null, result);
      return next();
    } catch (err) {
      if (err instanceof LocationLookupException) {
        return next(new ErrorDTO(ErrorCodes.LocationLookUp_ERROR, 'Cannot find location: ' + err.location, err));
      }
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during searching', err));
    }
  }


  public static async autocomplete(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.Search.AutoComplete.enabled === false) {
      return next();
    }
    if (!(req.params.text)) {
      return next();
    }

    let type: SearchQueryTypes = SearchQueryTypes.any_text;
    if (req.query[QueryParams.gallery.search.type]) {
      type = parseInt(<string>req.query[QueryParams.gallery.search.type], 10);
    }
    try {
      req.resultPipe = await ObjectManagers.getInstance().SearchManager.autocomplete(req.params.text, type);
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during searching', err));
    }

  }


  public static async getRandomImage(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.RandomPhoto.enabled === false || !(req.params.searchQueryDTO)) {
      return next();
    }

    try {
      const query: SearchQueryDTO = JSON.parse(<any>req.params.searchQueryDTO);

      const photo = await ObjectManagers.getInstance()
        .SearchManager.getRandomPhoto(query);
      if (!photo) {
        return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, 'No photo found'));
      }

      req.params.mediaPath = path.join(photo.directory.path, photo.directory.name, photo.name);
      return next();
    } catch (e) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Can\'t get random photo: ' + e.toString()));
    }
  }


}
