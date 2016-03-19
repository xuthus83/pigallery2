
import {UserManager} from "../model/UserManager";
import {NextFunction, Request, Response} from "express";
import {BaseMWs} from "./BaseMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {UserRoles} from "../../common/entities/User";
import {Utils} from "../../common/Utils";

export class AuthenticationMWs extends BaseMWs{

    
    public static authenticate(req:Request, res:Response, next:NextFunction){
        if (typeof req.session.user === 'undefined') {
            return super.renderError(res,new Error(ErrorCodes.NOT_AUTHENTICATED));
        }
        return next();
    }
    
    public static authorise(role:UserRoles){
        return (req:Request, res:Response, next:NextFunction) => {
            if (req.session.user.role < role) {
                return super.renderError(res, new Error(ErrorCodes.NOT_AUTHORISED));
            }
            return next();
        };
    }
    
    public static inverseAuthenticate(req:Request, res:Response, next:NextFunction){
        if (typeof req.session.user !== 'undefined') {
            return super.renderError(res,new Error(ErrorCodes.ALREADY_AUTHENTICATED));
        }
        return next();
    }
    
    public static login(req:Request, res:Response, next:NextFunction){
        //not enough parameter
       if ((typeof req.body === 'undefined') || (typeof req.body.logincredential === 'undefined') || (typeof req.body.logincredential.username === 'undefined') ||
            (typeof req.body.logincredential.password === 'undefined')) {
            return next();
        }

        //lets find the user
        UserManager.findOne({
              username: req.body.logincredential.username
        }, (err, result) => {
            if ((err) || (!result)) {
                return super.renderError(res,new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
            }

            //check password
            if (result.password !== req.body.logincredential.password) {
                return super.renderError(res,new Error(ErrorCodes.CREDENTIAL_NOT_FOUND));
            }

            req.session.user = result;

            return next();
        });
    }



    public static renderUser(req:Request, res:Response, next:NextFunction){
        let user = Utils.clone(req.session.user);
        delete user.password;
        super.renderMessage(res,user);
    }
    

}