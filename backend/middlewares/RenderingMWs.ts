
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {Utils} from "../../common/Utils";
import {Message} from "../../common/entities/Message";

export class RenderingMWs {

    public static renderResult(req:Request, res:Response, next:NextFunction){
        if(!req.resultPipe)
            return next();
        
         return RenderingMWs.renderMessage(res,req.resultPipe);
    }


    public static renderSessionUser(req:Request, res:Response, next:NextFunction){
        if(!(req.session.user)){
            return next(new Error(ErrorCodes.GENERAL_ERROR));
        }

        let user = Utils.clone(req.session.user);
        delete user.password;
        RenderingMWs.renderMessage(res,user);
    }

    public static renderFile(req:Request, res:Response, next:NextFunction){ 
       if(!req.resultPipe)
           return next();

        return res.sendFile(req.resultPipe);
    }

    public static renderOK(req:Request, res:Response, next:NextFunction){
        let message = new Message<string> (null,"ok");
        res.json(message);
    }

    public static renderError(err:any, req:Request, res:Response, next:NextFunction):any{
        if(err instanceof Error) {
            let message = new Message<any> (err,null);
            return res.json(message);
        }
        return next(err);
    }


    protected static renderMessage<T>(res:Response, content:T){
        let message = new Message<T> (null,content);
        res.json(message);
    }


}