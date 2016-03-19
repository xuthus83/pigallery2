
import {UserManager} from "../model/UserManager";
import {NextFunction, Request, Response} from "express";
import {BaseMWs} from "./BaseMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {UserRoles} from "../../common/entities/User";

export class UserRequestConstrainsMWs extends BaseMWs{


    public static forceSelfRequest(req:Request, res:Response, next:NextFunction){
        if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')) {
            return next();
        }
        if(req.session.user.id !== req.params.id){
            return super.renderError(res,new Error(ErrorCodes.NOT_AUTHORISED));            
        }
        
        return next();
    }


    public static notSelfRequest(req:Request, res:Response, next:NextFunction){
        if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')) {
            return next();
        }
        
        if(req.session.user.id === req.params.id){
            return super.renderError(res,new Error(ErrorCodes.NOT_AUTHORISED));
        }

        return next();
    }
    
    public static notSelfRequestOr2Admins(req:Request, res:Response, next:NextFunction){
        if ((typeof req.params === 'undefined') || (typeof req.params.id === 'undefined')) {
            return next();
        }
        
        if(req.session.user.id !== req.params.id){
            return next();
        }

        UserManager.find({minRole:UserRoles.Admin}, (err, result) =>{
            if ((err) || (!result)) {
                return super.renderError(res,new Error(ErrorCodes.GENERAL_ERROR));
            }
            if(result.length <= 1) {
                return super.renderError(res, new Error(ErrorCodes.GENERAL_ERROR));
            }
            
        });
        
        return next();
    }
    


}