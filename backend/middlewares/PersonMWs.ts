import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {ObjectManagerRepository} from '../model/ObjectManagerRepository';


const LOG_TAG = '[PersonMWs]';

export class PersonMWs {


  public static async listPersons(req: Request, res: Response, next: NextFunction) {


    try {
      req.resultPipe = await ObjectManagerRepository.getInstance()
        .PersonManager.getAll();

      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during listing the directory', err));
    }
  }


  public static async getSamplePhoto(req: Request, res: Response, next: NextFunction) {
    if (!req.params.name) {
      return next();
    }
    const name = req.params.name;
    try {
      const photo = await ObjectManagerRepository.getInstance()
        .PersonManager.getSamplePhoto(name);

      if (photo === null) {
        return next();
      }
      req.resultPipe = photo;
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, 'Error during listing the directory', err));
    }
  }

}
