import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {ObjectManagers} from '../model/ObjectManagers';
import {PersonDTO} from '../../common/entities/PersonDTO';
import {PhotoDTO} from '../../common/entities/PhotoDTO';


const LOG_TAG = '[PersonMWs]';

export class PersonMWs {


  public static async updatePerson(req: Request, res: Response, next: NextFunction) {
    if (!req.params.name) {
      return next();
    }

    try {
      req.resultPipe = await ObjectManagers.getInstance()
        .PersonManager.updatePerson(req.params.name as string,
          req.body as PersonDTO);
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.PERSON_ERROR, 'Error during updating a person', err));
    }
  }

  public static async listPersons(req: Request, res: Response, next: NextFunction) {
    try {
      req.resultPipe = await ObjectManagers.getInstance()
        .PersonManager.getAll();

      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.PERSON_ERROR, 'Error during listing persons', err));
    }
  }


  public static async addSamplePhotoForAll(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }
    try {
      const persons = (req.resultPipe as PersonWithPhoto[]);
      const photoMap = await ObjectManagers.getInstance()
        .PersonManager.getSamplePhotos(persons.map(p => p.name));
      persons.forEach(p => p.samplePhoto = photoMap[p.name]);

      req.resultPipe = persons;
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.PERSON_ERROR, 'Error during adding sample photo for all persons', err));
    }
  }


  public static async removeSamplePhotoForAll(req: Request, res: Response, next: NextFunction) {
    if (!req.resultPipe) {
      return next();
    }
    try {
      const persons = (req.resultPipe as PersonWithPhoto[]);
      for (let i = 0; i < persons.length; i++) {
        delete persons[i].samplePhoto;
      }
      req.resultPipe = persons;
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.PERSON_ERROR, 'Error during removing sample photo from all persons', err));
    }
  }


  public static async getSamplePhoto(req: Request, res: Response, next: NextFunction) {
    if (!req.params.name) {
      return next();
    }
    const name = req.params.name;
    try {
      const photo = await ObjectManagers.getInstance()
        .PersonManager.getSamplePhoto(name);

      if (photo === null) {
        return next();
      }
      req.resultPipe = photo;
      return next();

    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.PERSON_ERROR, 'Error during getting sample photo for a person', err));
    }
  }

}


export interface PersonWithPhoto extends PersonDTO {
  samplePhoto: PhotoDTO;
}
