
import {UserManager} from "../model/UserManager";
import {NextFunction, Request, Response} from "express";
import {BaseMWs} from "./BaseMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";

export class UserMWs extends BaseMWs{

    
    public static authenticate(req:Request, res:Response, next:NextFunction){
        if (typeof req.session.user === 'undefined') {
            return super.renderError(res,new Error(ErrorCodes.NOT_AUTHENTICATED));
        }
        return next();
    }
    
    public static inverseAuthenticate(req:Request, res:Response, next:NextFunction){
        if (typeof req.session.user !== 'undefined') {
            return super.renderError(res,new Error(ErrorCodes.ALREADY_AUTHENTICATED));
        }
        return next();
    }
    
    public static login(req:Request, res:Response, next:NextFunction){
        //not enough parameter
    /*    if ((typeof req.body === 'undefined') || (typeof req.body.email === 'undefined') ||
            (typeof req.body.password === 'undefined')) {
            return next();
        }*/

        //lets find the user
        UserManager.findOne({
          //  email: req.body.email
        }, function (err, result) {
            if ((err) || (!result)) {
    //            res.tpl.error.push('Your email address is not registered!');
                console.log(err);
                return next();
            }

       /*     //check password
            if (result.password !== req.body.password) {
            //    res.tpl.error.push('Wrong password!');
                return next();
            }
*/
            //login is ok, save id to session
            req.session.user = result;

            //redirect to / so the app can decide where to go next
        //    return res.redirect('/');

            return next();
        });
    }


    public static renderUser(req:Request, res:Response, next:NextFunction){
        super.renderMessage(res,req.session.user);
    }
    

}