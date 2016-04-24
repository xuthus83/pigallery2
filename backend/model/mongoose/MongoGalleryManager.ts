import * as path from 'path';
import {Schema} from "mongoose";

import {Directory} from "../../../common/entities/Directory";
import {IGalleryManager} from "../IGalleryManager";
import {DatabaseManager} from "./DatabaseManager";
import {DiskManager} from "../DiskManger";
import {Utils} from "../../../common/Utils";

export class MongoGalleryManager implements IGalleryManager{
    private DirectoryModel;
    private PhotoModel;

    constructor(){
        this.DirectoryModel = DatabaseManager.getInstance().getModel('directory',{
            name:String,
            path:String,
            lastUpdate:Date,
            directories: [{
                type: Schema.Types.ObjectId,
                ref: 'directory'
            }],
            photos: [{
                type: Schema.Types.ObjectId,
                ref: 'photo'
            }]
        });
        this.PhotoModel = DatabaseManager.getInstance().getModel('photo',{
            name:String,
            width:Number,
            height:Number
        });
    }

    public listDirectory(relativeDirectoryName, cb:(error: any,result:Directory) => void){
        let directoryName = path.basename(relativeDirectoryName);
        let directoryParent = path.join( path.dirname(relativeDirectoryName),"/");

        this.DirectoryModel.findOne({name:directoryName, path: directoryParent}).populate('photos').populate('directories').exec( (err,res) =>{
            if(err || !res){
                return  this.indexDirectory(relativeDirectoryName,cb);
            }
            return cb(err,res);
        });

    }

    public indexDirectory(relativeDirectoryName, cb:(error: any,result:Directory) => void){
        DiskManager.scanDirectory(relativeDirectoryName,(err,scannedDirectory)=>{
            let arr = [];
            scannedDirectory.directories.forEach((value) => {
                let dir = new this.DirectoryModel(value);
                Utils.setKeys(dir,value);
                dir.save();
                arr.push(dir);
            });
            scannedDirectory.directories = arr;
            arr = [];
            scannedDirectory.photos.forEach((value) => {
                let p = new this.PhotoModel(value);
                Utils.setKeys(p,value);
                p.save();
                arr.push(p);
            });

            scannedDirectory.photos = arr;
            this.DirectoryModel.create(scannedDirectory,(err)=>{
                return cb(err,scannedDirectory);
            });

        });
    }



}