import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../../common/entities/Error";
import {ObjectManagerRepository} from "../../model/ObjectManagerRepository";
import {Utils} from "../../../common/Utils";
import {Config} from "../../../common/config/private/Config";

export class UserMWs {

  public static async changePassword(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.authenticationRequired === false) {
      return next(new Error(ErrorCodes.USER_MANAGEMENT_DISABLED));
    }
    if ((typeof req.body === 'undefined') || (typeof req.body.userModReq === 'undefined')
      || (typeof req.body.userModReq.id === 'undefined')
      || (typeof req.body.userModReq.oldPassword === 'undefined')
      || (typeof req.body.userModReq.newPassword === 'undefined')) {
      return next();
    }

    try {
      await ObjectManagerRepository.getInstance().UserManager.changePassword(req.body.userModReq);
      return next();

    } catch (err) {
      return next(new Error(ErrorCodes.GENERAL_ERROR));
    }
  }


  public static async createUser(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.authenticationRequired === false) {
      return next(new Error(ErrorCodes.USER_MANAGEMENT_DISABLED));
    }
    if ((typeof req.body === 'undefined') || (typeof req.body.newUser === 'undefined')) {
      return next();
    }

    try {
      await ObjectManagerRepository.getInstance().UserManager.createUser(req.body.newUser);
      return next();

    } catch (err) {
      return next(new Error(ErrorCodes.USER_CREATION_ERROR));
    }


  }

  public static async deleteUser(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.authenticationRequired === false) {
      return next(new Error(ErrorCodes.USER_MANAGEMENT_DISABLED));
    }
    if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')) {
      return next();
    }


    try {
      await ObjectManagerRepository.getInstance().UserManager.deleteUser(req.params.id);
      return next();

    } catch (err) {
      return next(new Error(ErrorCodes.GENERAL_ERROR));
    }


  }

  public static async changeRole(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.authenticationRequired === false) {
      return next(new Error(ErrorCodes.USER_MANAGEMENT_DISABLED));
    }
    if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')
      || (typeof req.body === 'undefined') || (typeof req.body.newRole === 'undefined')) {
      return next();
    }

    try {
      await  ObjectManagerRepository.getInstance().UserManager.changeRole(req.params.id, req.body.newRole);
      return next();

    } catch (err) {
      return next(new Error(ErrorCodes.GENERAL_ERROR));
    }
  }


  public static async listUsers(req: Request, res: Response, next: NextFunction) {
    if (Config.Client.authenticationRequired === false) {
      return next(new Error(ErrorCodes.USER_MANAGEMENT_DISABLED));
    }

    try {
      let result = await ObjectManagerRepository.getInstance().UserManager.find({});
      result = Utils.clone(result);
      for (let i = 0; i < result.length; i++) {
        result[i].password = "";
      }

      req.resultPipe = result;
    } catch (err) {
      return next(new Error(ErrorCodes.GENERAL_ERROR));
    }
  }


}
