import {NextFunction, Request, Response} from "express";
import {CreateSharingDTO, SharingDTO} from "../../common/entities/SharingDTO";
import {ObjectManagerRepository} from "../model/ObjectManagerRepository";
import {Logger} from "../Logger";
import {Error, ErrorCodes} from "../../common/entities/Error";

const LOG_TAG = "[SharingMWs]";
export class SharingMWs {


  private static generateKey(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4();
  }


  public static async getSharing(req: Request, res: Response, next: NextFunction) {
    const sharingKey = req.params.sharingKey;

    try {
      req.resultPipe = await ObjectManagerRepository.getInstance().SharingManager.findOne({sharingKey: sharingKey});
      return next();

    } catch (err) {
      Logger.warn(LOG_TAG, "Error during retrieving sharing link", err);
      console.error(err);
      return next(new Error(ErrorCodes.GENERAL_ERROR, err));
    }

  }

  public static async createSharing(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.createSharing === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "createSharing filed is missing"));
    }
    const createSharing: CreateSharingDTO = req.body.createSharing;
    let sharingKey = SharingMWs.generateKey();

    //create one not yet used

    while (true) {
      try {
        await ObjectManagerRepository.getInstance().SharingManager.findOne({sharingKey: sharingKey});
        sharingKey = this.generateKey();
      } catch (err) {
        break;
      }
    }


    const directoryName = req.params.directory || "/";
    let sharing: SharingDTO = {
      id: null,
      sharingKey: sharingKey,
      path: directoryName,
      password: createSharing.password,
      creator: req.session.user,
      expires: Date.now() + createSharing.valid,
      includeSubfolders: createSharing.includeSubfolders,
      timeStamp: Date.now()
    };

    try {

      req.resultPipe = await ObjectManagerRepository.getInstance().SharingManager.createSharing(sharing);
      return next();

    } catch (err) {
      Logger.warn(LOG_TAG, "Error during creating sharing link", err);
      console.error(err);
      return next(new Error(ErrorCodes.GENERAL_ERROR, err));
    }
  }

  public static async updateSharing(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.updateSharing === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "updateSharing filed is missing"));
    }
    const updateSharing: CreateSharingDTO = req.body.updateSharing;
    const directoryName = req.params.directory || "/";
    let sharing: SharingDTO = {
      id: updateSharing.id,
      path: directoryName,
      sharingKey: "",
      password: updateSharing.password,
      creator: req.session.user,
      expires: Date.now() + updateSharing.valid,
      includeSubfolders: updateSharing.includeSubfolders,
      timeStamp: Date.now()
    };

    try {

      req.resultPipe = await ObjectManagerRepository.getInstance().SharingManager.updateSharing(sharing);
      return next();

    } catch (err) {
      Logger.warn(LOG_TAG, "Error during creating sharing link", err);
      console.error(err);
      return next(new Error(ErrorCodes.GENERAL_ERROR, err));
    }

  }
}
