///<reference path="ExtendedRequest.d.ts"/>
///<reference path="../../typings/main.d.ts"/>


import {UserManager} from "../model/UserManager";
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {UserRoles} from "../../common/entities/User";

export class AuthenticationMWs {

    
    public static authenticate(req:Request, res:Response, next:NextFunction){
     /*   if (typeof req.session.user === 'undefined') {
            return next(new Error(ErrorCodes.NOT_AUTHENTICATED));
        }*/
        return next();
    }
    
    public static authorise(role:UserRoles){
        return (req:Request, res:Response, next:NextFunction) => {
            if (req.session.user.role < role) {
                return next(new Error(ErrorCodes.NOT_AUTHORISED));
            }
            return next();
        };
    }
    
    public static inverseAuthenticate(req:Request, res:Response, next:NextFunction){
        if (typeof req.session.user !== 'undefined') {
            return next(new Error(ErrorCodes.ALREADY_AUTHENTICATED));
        }
        return next();
    }
    
    public static login(req:Request, res:Response, next:NextFunction){
        //not enough parameter
       if ((typeof req.body === 'undefined') || (typeof req.body.loginCredential === 'undefined') || (typeof req.body.loginCredential.username === 'undefined') ||
            (typeof req.body.loginCredential.password === 'undefined')) {
            return next();
        }

        //lets find the user
        UserManager.findOne({
              username: req.body.loginCredential.username,
              password: req.body.loginCredential.password
        }, (err, result) => {
            if ((err) || (!result)) {
                return next(new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
            }


            req.session.user = result;

            return next();
        });
    }



    

}