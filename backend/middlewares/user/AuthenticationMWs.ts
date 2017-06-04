///<reference path="../customtypings/ExtendedRequest.d.ts"/>
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../../common/entities/Error";
import {UserDTO, UserRoles} from "../../../common/entities/UserDTO";
import {ObjectManagerRepository} from "../../model/ObjectManagerRepository";
import {Config} from "../../../common/config/private/Config";

export class AuthenticationMWs {

    public static authenticate(req: Request, res: Response, next: NextFunction) {
        if (Config.Client.authenticationRequired === false) {
            req.session.user = <UserDTO>{name: "", role: UserRoles.Admin};

            return next();
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

    public static inverseAuthenticate(req: Request, res: Response, next: NextFunction) {
        if (typeof req.session.user !== 'undefined') {
            return next(new Error(ErrorCodes.ALREADY_AUTHENTICATED));
        }
        return next();
    }

    public static login(req: Request, res: Response, next: NextFunction) {
        //not enough parameter
        if ((typeof req.body === 'undefined') || (typeof req.body.loginCredential === 'undefined') || (typeof req.body.loginCredential.username === 'undefined') ||
            (typeof req.body.loginCredential.password === 'undefined')) {
            return next();
        }

        //lets find the user
        ObjectManagerRepository.getInstance().getUserManager().findOne({
            name: req.body.loginCredential.username,
            password: req.body.loginCredential.password
        }, (err, result) => {
            if ((err) || (!result)) {
                console.error(err);
                return next(new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
            }


            req.session.user = result;

            return next();
        });
    }

    public static logout(req: Request, res: Response, next: NextFunction) {
        delete req.session.user;
        return next();
    }

}