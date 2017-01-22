///<reference path="customtypings/jimp.d.ts"/>
import * as path from "path";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {Config} from "../config/Config";
import {ContentWrapper} from "../../common/entities/ConentWrapper";
import {DirectoryDTO} from "../../common/entities/DirectoryDTO";
import {ProjectPath} from "../ProjectPath";
import {PhotoDTO} from "../../common/entities/PhotoDTO";


Config.Client.concurrentThumbnailGenerations = Math.max(1, os.cpus().length - 1);

const Pool = require('threads').Pool;
const pool = new Pool(Config.Client.concurrentThumbnailGenerations);

pool.run(
    (input: {imagePath: string, size: number, thPath: string}, done) => {

        //generate thumbnail
        let Jimp = require("jimp");
        Jimp.read(input.imagePath).then((image) => {
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
            let newWidth = Math.sqrt((input.size * input.size) / ratio);

            image.resize(newWidth, Jimp.AUTO, Jimp.RESIZE_BEZIER);

            image.quality(60);        // set JPEG quality
            image.write(input.thPath, () => { // save
                return done();
            });
        }).catch(function (err) {
            return done(new Error(ErrorCodes.GENERAL_ERROR));
        });
    }
);


export class ThumbnailGeneratorMWs {


    private static addThInfoTODir(directory: DirectoryDTO) {
        if (typeof  directory.photos == "undefined") {
            directory.photos = [];
        }
        if (typeof  directory.directories == "undefined") {
            directory.directories = [];
        }
        ThumbnailGeneratorMWs.addThInfoToPhotos(directory.photos);

        for (let i = 0; i < directory.directories.length; i++) {
            ThumbnailGeneratorMWs.addThInfoTODir(directory.directories[i]);
        }

    }

    private static addThInfoToPhotos(photos: Array<PhotoDTO>) {
        let thumbnailFolder = ProjectPath.ThumbnailFolder;
        for (let j = 0; j < Config.Client.thumbnailSizes.length; j++) {
            let size = Config.Client.thumbnailSizes[j];
            for (let i = 0; i < photos.length; i++) {
                let fullImagePath = path.join(ProjectPath.ImageFolder, photos[i].directory.path, photos[i].directory.name, photos[i].name);
                let thPath = path.join(thumbnailFolder, ThumbnailGeneratorMWs.generateThumbnailName(fullImagePath, size));
                if (fs.existsSync(thPath) === true) {
                    if (typeof  photos[i].readyThumbnails == "undefined") {
                        photos[i].readyThumbnails = [];
                    }
                    photos[i].readyThumbnails.push(size);
                }
            }
        }
    }

    public static addThumbnailInformation(req: Request, res: Response, next: NextFunction) {
        if (!req.resultPipe)
            return next();

        let cw: ContentWrapper = req.resultPipe;
        if (cw.directory) {
            ThumbnailGeneratorMWs.addThInfoTODir(cw.directory);
        }
        if (cw.searchResult) {
            ThumbnailGeneratorMWs.addThInfoToPhotos(cw.searchResult.photos);
        }


        return next();

    }

    public static generateThumbnail(req: Request, res: Response, next: NextFunction) {
        if (!req.resultPipe)
            return next();

        //load parameters
        let imagePath = req.resultPipe;
        let size: number = parseInt(req.params.size) || Config.Client.thumbnailSizes[0];

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

        //run on other thread
        pool.send({imagePath: imagePath, size: size, thPath: thPath})
            .on('done', (out) => {
                return next(out);
            }).on('error', (job, error) => {
            return next(new Error(ErrorCodes.GENERAL_ERROR, error));
        });


    }

    private static generateThumbnailName(imagePath: string, size: number): string {
        return crypto.createHash('md5').update(imagePath).digest('hex') + "_" + size + ".jpg";
    }
}