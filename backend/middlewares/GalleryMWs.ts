
import * as path from 'path';
import * as fs from 'fs';
import {NextFunction, Request, Response} from "express";
import {BaseMWs} from "./BaseMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {GalleryManager} from "../model/GalleryManager";
import {Directory} from "../../common/entities/Directory";

export class GalleryMWs extends BaseMWs{

  
    public static listDirectory(req:Request, res:Response, next:NextFunction){
        let directoryName = "/";
        if(req.params.directory){
            directoryName = req.params.directory;
        }

        let absoluteDirectoryName = path.join(__dirname,"/../../demo/images", directoryName);
        if(!fs.statSync(absoluteDirectoryName).isDirectory()){
            return next();
        }

        GalleryManager.listDirectory(directoryName,(err,directory:Directory) => {
           if(err || !directory){
               return super.renderError(res,new Error(ErrorCodes.GENERAL_ERROR,err));
           }

            return super.renderMessage(res,directory);
        });
    }


    public static renderImage(req:Request, res:Response, next:NextFunction){
        let directoryName = "/";
        if(req.params.directory){
            directoryName = req.params.directory;
        }
        if(!(req.params.image)){
            return next();
        }

        let fullImagePath =  path.join(__dirname,"/../../demo/images", directoryName,req.params.image);
        if(fs.statSync(fullImagePath).isDirectory()){
            return next();
        }

        return res.sendFile(fullImagePath);
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