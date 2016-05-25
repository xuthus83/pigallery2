import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../../common/entities/Error";
import {UserRoles} from "../../../common/entities/User";
import {ObjectManagerRepository} from "../../model/ObjectManagerRepository";

export class UserRequestConstrainsMWs {

    public static forceSelfRequest(req:Request, res:Response, next:NextFunction) {
        if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')) {
            return next();
        }
        if (req.session.user.id !== req.params.id) {
            return next(new Error(ErrorCodes.NOT_AUTHORISED));
        }

        return next();
    }


    public static notSelfRequest(req:Request, res:Response, next:NextFunction) {
        if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')) {
            return next();
        }

        if (req.session.user.id === req.params.id) {
            return next(new Error(ErrorCodes.NOT_AUTHORISED));
        }

        return next();
    }

    public static notSelfRequestOr2Admins(req:Request, res:Response, next:NextFunction) {
        if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')) {
            return next();
        }

        if (req.session.user.id !== req.params.id) {
            return next();
        }
        //TODO: fix it!
        ObjectManagerRepository.getInstance().getUserManager().find({minRole: UserRoles.Admin}, (err, result) => {
            if ((err) || (!result)) {
                return next(new Error(ErrorCodes.GENERAL_ERROR));
            }
            if (result.length <= 1) {
                return next(new Error(ErrorCodes.GENERAL_ERROR));
            }

        });

        return next();
    }


}