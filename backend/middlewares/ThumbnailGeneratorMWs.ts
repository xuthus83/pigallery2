
import * as path from 'path';
import * as Jimp from 'jimp';
import * as crypto from 'crypto';
import * as fs from 'fs';
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";

export class ThumbnailGeneratorMWs {

    public static generateThumbnail(req:Request, res:Response, next:NextFunction){ 
        if(!req.resultPipe)
            return next();

        let imagePath = req.resultPipe;
        let size:number = parseInt(req.params.size) || 200; //TODO:put to config


        let thPath = path.join(__dirname,"/../../demo/TEMP",ThumbnailGeneratorMWs.generateThumbnailName(imagePath,size));
        req.resultPipe = thPath;

        if(fs.existsSync(thPath) === true){ 
            return next();
        }

        Jimp.read(imagePath).then( (image) => {
            if (image.bitmap.with < image.bitmap.height) {
                image.resize(size, Jimp.AUTO);   // resize
            }else{
                image.resize(Jimp.AUTO, size);   // resize
            }

            image.quality(60);        // set JPEG quality
            image.write(thPath, () =>{ // save
                return next();
            });     
        }).catch(function (err) {
            return next(new Error(ErrorCodes.GENERAL_ERROR)); 
        });
    }

    private static generateThumbnailName(imagePath:string,size:number):string{
        return crypto.createHash('md5').update(imagePath).digest('hex')+"_"+size+".jpg";
    }
}