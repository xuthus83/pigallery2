///<reference path="../customtypings/ExtendedRequest.d.ts"/>
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../../common/entities/Error";
import {UserDTO, UserRoles} from "../../../common/entities/UserDTO";
import {ObjectManagerRepository} from "../../model/ObjectManagerRepository";
import {Config} from "../../../common/config/private/Config";

export class AuthenticationMWs {

  private static async getSharingUser(req: Request) {
    if (Config.Client.Sharing.enabled === true &&
      (!!req.query.sk || !!req.params.sharingKey)) {
      const sharing = await ObjectManagerRepository.getInstance().SharingManager.findOne({
        sharingKey: req.query.sk || req.params.sharingKey,
      });
      if (!sharing || sharing.expires < Date.now()) {
        return null;
      }

      if (Config.Client.Sharing.passwordProtected === true && sharing.password) {
        return null;
      }

      let path = sharing.path;
      if (sharing.includeSubfolders == true) {
        path += "*";
      }
      return <UserDTO>{name: "Guest", role: UserRoles.LimitedGuest, permissions: [path]};

    }
    return null;
  }

  public static async authenticate(req: Request, res: Response, next: NextFunction) {

    if (Config.Client.authenticationRequired === false) {
      req.session.user = <UserDTO>{name: "", role: UserRoles.Admin};
      return next();
    }
    try {
      const user = await AuthenticationMWs.getSharingUser(req);
      if (!!user) {
        req.session.user = user;
        return next();
      }
    } catch (err) {
      console.error(err);
      return next(new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
    }
    if (typeof req.session.user === 'undefined') {
      return next(new Error(ErrorCodes.NOT_AUTHENTICATED));
    }
    return next();
  }

  public static authorise(role: UserRoles) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.session.user.role < role) {
        return next(new Error(ErrorCodes.NOT_AUTHORISED));
      }
      return next();
    };
  }

  public static authoriseDirectory(req: Request, res: Response, next: NextFunction) {
    if (req.session.user.permissions == null ||
      req.session.user.permissions.length == 0 ||
      req.session.user.permissions[0] == "/") {
      return next();
    }

    const directoryName = req.params.directory || "/";
    if (UserDTO.isPathAvailable(directoryName, req.session.user.permissions) == true) {
      return next();

    }
    return next(new Error(ErrorCodes.PERMISSION_DENIED));
  }

  public static inverseAuthenticate(req: Request, res: Response, next: NextFunction) {
    if (typeof req.session.user !== 'undefined') {
      return next(new Error(ErrorCodes.ALREADY_AUTHENTICATED));
    }
    return next();
  }

  public static async login(req: Request, res: Response, next: NextFunction) {

    //not enough parameter
    if ((typeof req.body === 'undefined') || (typeof req.body.loginCredential === 'undefined') || (typeof req.body.loginCredential.username === 'undefined') ||
      (typeof req.body.loginCredential.password === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR));
    }
    //TODO: implement remember me
    try {
      //lets find the user
      req.session.user = await ObjectManagerRepository.getInstance().UserManager.findOne({
        name: req.body.loginCredential.username,
        password: req.body.loginCredential.password
      });
      return next();

    } catch (err) {
      //if its a shared link, login as guest
      try {
        const user = await AuthenticationMWs.getSharingUser(req);
        if (user) {
          req.session.user = user;
          return next();
        }
      } catch (err) {
        console.error(err);
        return next(new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
      }

      console.error(err);
      return next(new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
    }


  }


  public static async shareLogin(req: Request, res: Response, next: NextFunction) {

    if (Config.Client.Sharing.enabled === false) {
      return next();
    }
    //not enough parameter
    if ((!req.query.sk && !req.params.sharingKey)) {
      return next(new Error(ErrorCodes.INPUT_ERROR));
    }

    try {
      const password = (req.body ? req.body.password : null) || null;

      const sharing = await ObjectManagerRepository.getInstance().SharingManager.findOne({
        sharingKey: req.query.sk || req.params.sharingKey,
      });
      if (!sharing || sharing.expires < Date.now() ||
        (Config.Client.Sharing.passwordProtected === true && sharing.password !== password)) {
        return next(new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
      }

      let path = sharing.path;
      if (sharing.includeSubfolders == true) {
        path += "*";
      }

      req.session.user = <UserDTO>{name: "Guest", role: UserRoles.LimitedGuest, permissions: [path]};
      return next();

    } catch (err) {
      return next(new Error(ErrorCodes.GENERAL_ERROR));
    }

  }

  public static logout(req: Request, res: Response, next: NextFunction) {
    delete req.session.user;
    return next();
  }

}
