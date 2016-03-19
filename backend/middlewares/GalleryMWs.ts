
import {UserManager} from "../model/UserManager";
import {NextFunction, Request, Response} from "express";
import {BaseMWs} from "./BaseMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";
import Util = jasmine.Util;

export class GalleryMWs extends BaseMWs{

  
    public static listDirectory(req:Request, res:Response, next:NextFunction){
        //TODO: implement
        return super.renderError(res,new Error(ErrorCodes.GENERAL_ERROR));
    }


    public static renderImage(req:Request, res:Response, next:NextFunction){
        //TODO: implement
        return super.renderError(res,new Error(ErrorCodes.GENERAL_ERROR));
    }

    public static renderThumbnail(req:Request, res:Response, next:NextFunction){
        //TODO: implement
        return super.renderError(res,new Error(ErrorCodes.GENERAL_ERROR));
    }

    public static search(req:Request, res:Response, next:NextFunction){
        //TODO: implement
        return super.renderError(res,new Error(ErrorCodes.GENERAL_ERROR));
    }

    public static autocomplete(req:Request, res:Response, next:NextFunction){
        //TODO: implement
        return super.renderError(res,new Error(ErrorCodes.GENERAL_ERROR));
    }



}