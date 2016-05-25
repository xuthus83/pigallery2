///<reference path="customtypings/jimp.d.ts"/>


import * as path from "path";
import * as Jimp from "jimp";
import * as crypto from "crypto";
import * as fs from "fs";
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {Config} from "../config/Config";


export class ThumbnailGeneratorMWs {

    private static getThumbnailFolder() {
        return path.join(__dirname, "/../../", Config.Server.thumbnailFolder);
    }

    public static generateThumbnail(req:Request, res:Response, next:NextFunction) {
        if (!req.resultPipe)
            return next();

        //load parameters
        let imagePath = req.resultPipe;
        let size:number = parseInt(req.params.size) || Config.Client.thumbnailSizes[0];
        let thumbnailFolder = ThumbnailGeneratorMWs.getThumbnailFolder();

        //validate size
        if (Config.Client.thumbnailSizes.indexOf(size) === -1) {
            size = Config.Client.thumbnailSizes[0];
        }

        //generate thumbnail path
        let thPath = path.join(thumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(imagePath, size));


        req.resultPipe = thPath;

        //check if thumbnail already exist
        if (fs.existsSync(thPath) === true) {
            return next();
        }

        //create thumbnail folder if not exist
        if (!fs.existsSync(thumbnailFolder)) {
            fs.mkdirSync(thumbnailFolder);
        }

        //generate thumbnail
        Jimp.read(imagePath).then((image) => {
            /**
             * newWidth * newHeight = size*size
             * newHeight/newWidth = height/width
             *
             * newHeight = (height/width)*newWidth
             * newWidth * newWidth = (size*size) / (height/width)
             *
             * @type {number}
             */
            let ratio = image.bitmap.height / image.bitmap.width;
            let newWidth = Math.sqrt((size * size) / ratio);

            image.resize(newWidth, Jimp.AUTO, Jimp.RESIZE_BEZIER);

            image.quality(60);        // set JPEG quality
            image.write(thPath, () => { // save
                return next();
            });
        }).catch(function (err) {
            return next(new Error(ErrorCodes.GENERAL_ERROR));
        });

    }

    private static generateThumbnailName(imagePath:string, size:number):string {
        return crypto.createHash('md5').update(imagePath).digest('hex') + "_" + size + ".jpg";
    }
}