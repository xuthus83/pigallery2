
import {NextFunction, Request, Response} from "express";
import {Message} from "../../common/entities/Message";
import {Error} from "../../common/entities/Error";

export class BaseMWs {
    
    protected static renderMessage<T>(res:Response, content:T){
        let message = new Message<T> ([],content);
        res.json(message);
    }
    protected static renderError(res:Response, error:Error){
        let message = new Message<any> ([],null);
        res.json(message);
    }
}