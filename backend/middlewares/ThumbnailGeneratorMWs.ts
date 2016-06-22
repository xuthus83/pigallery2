///<reference path="customtypings/jimp.d.ts"/>


import * as path from "path";
import * as Jimp from "jimp";
import * as crypto from "crypto";
import * as fs from "fs";
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {Config} from "../config/Config";
import {ContentWrapper} from "../../common/entities/ConentWrapper";
import {Directory} from "../../common/entities/Directory";
import {ProjectPath} from "../ProjectPath";
import {Photo} from "../../common/entities/Photo";


export class ThumbnailGeneratorMWs {


    private static addThInfoTODir(directory:Directory) {
        ThumbnailGeneratorMWs.addThInfoToPhotos(directory.photos);

        for (let i = 0; i < directory.directories.length; i++) {
            ThumbnailGeneratorMWs.addThInfoTODir(directory.directories[i]);
        }

    }

    private static addThInfoToPhotos(photos:Array<Photo>) {
        let thumbnailFolder = ProjectPath.ThumbnailFolder;
        for (let j = 0; j < Config.Client.thumbnailSizes.length; j++) {
            let size = Config.Client.thumbnailSizes[j];
            for (let i = 0; i < photos.length; i++) {
                let fullImagePath = path.join(ProjectPath.ImageFolder, photos[i].directory.path, photos[i].directory.name, photos[i].name);
                let thPath = path.join(thumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(fullImagePath, size));
                if (fs.existsSync(thPath) === true) {
                    photos[i].readyThumbnails.push(size);
                }
            }
        }
    }

    public static addThumbnailInformation(req:Request, res:Response, next:NextFunction) {
        if (!req.resultPipe)
            return next();

        let cw:ContentWrapper = req.resultPipe;
        if (cw.directory) {
            ThumbnailGeneratorMWs.addThInfoTODir(cw.directory);
        }
        if (cw.searchResult) {
            ThumbnailGeneratorMWs.addThInfoToPhotos(cw.searchResult.photos);
        }


        return next();
        
    }

    public static generateThumbnail(req:Request, res:Response, next:NextFunction) {
        if (!req.resultPipe)
            return next();

        //load parameters
        let imagePath = req.resultPipe;
        let size:number = parseInt(req.params.size) || Config.Client.thumbnailSizes[0]; 

        //validate size
        if (Config.Client.thumbnailSizes.indexOf(size) === -1) {
            size = Config.Client.thumbnailSizes[0];
        }

        //generate thumbnail path
        let thPath = path.join(ProjectPath.ThumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(imagePath, size));


        req.resultPipe = thPath;

        //check if thumbnail already exist
        if (fs.existsSync(thPath) === true) {
            return next();
        }

        //create thumbnail folder if not exist
        if (!fs.existsSync(ProjectPath.ThumbnailFolder)) {
            fs.mkdirSync(ProjectPath.ThumbnailFolder);
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