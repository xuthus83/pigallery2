
import {UserManager} from "../model/UserManager";
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";

export class UserMWs {

    public static changePassword(req:Request, res:Response, next:NextFunction){
        if ((typeof req.body === 'undefined') || (typeof req.body.userModReq === 'undefined')
            || (typeof req.body.userModReq.id === 'undefined')
            || (typeof req.body.userModReq.oldPassword === 'undefined')
            || (typeof req.body.userModReq.newPassword === 'undefined')) {
            return next();
        }
        
        UserManager.changePassword(req.body.userModReq, (err, result) =>{
            if ((err) || (!result)) {
                return next(new Error(ErrorCodes.GENERAL_ERROR));
            }

            return next();
        });
    }
    

    public static createUser(req:Request, res:Response, next:NextFunction){
        if ((typeof req.body === 'undefined') || (typeof req.body.newUser === 'undefined')) {
            return next();
        }

        UserManager.createUser(req.body.newUser, (err, result) =>{
            if ((err) || (!result)) {
                return next(new Error(ErrorCodes.USER_CREATION_ERROR));
            }


            return next();
        });

    }

    public static deleteUser(req:Request, res:Response, next:NextFunction){
        if ((typeof req.body === 'undefined') || (typeof req.body.newUser === 'undefined')
            || (typeof req.body.userModReq.id === 'undefined')) {
            return next();
        }

        UserManager.deleteUser(req.body.userModReq.id, (err, result) =>{
            if ((err) || (!result)) {
                return next(new Error(ErrorCodes.GENERAL_ERROR));
            }


            return next();
        });

    }

    public static changeRole(req:Request, res:Response, next:NextFunction){
        if ((typeof req.body === 'undefined') || (typeof req.body.userModReq === 'undefined')
            || (typeof req.body.userModReq.id === 'undefined')
            || (typeof req.body.userModReq.newRole === 'undefined')) {
            return next();
        }

        UserManager.changeRole(req.body.userModReq, (err, result) =>{
            if ((err) || (!result)) {
                return next(new Error(ErrorCodes.GENERAL_ERROR));
            }

            return next();
        });
    }


    public static listUsers(req:Request, res:Response, next:NextFunction){
        UserManager.find({}, (err, result) =>{
            if ((err) || (!result)) {
                return next(new Error(ErrorCodes.GENERAL_ERROR));
            }

            req.resultPipe = result;
            return next();
        });
    }
    



}