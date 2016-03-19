
import {NextFunction, Request, Response} from "express";
import {Message} from "../../common/entities/Message";
import {Error} from "../../common/entities/Error";

export class BaseMWs {
    
    protected static renderMessage<T>(res:Response, content:T){
        let message = new Message<T> (null,content);
        res.json(message);
    }
    protected static renderError(res:Response, error:Error){
        let message = new Message<any> (error,null);
        res.json(message);
    }

    public static renderOK(req:Request, res:Response, next:NextFunction){
            let message = new Message<string> (null,"ok");
            res.json(message);
     }
}