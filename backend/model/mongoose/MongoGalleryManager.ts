import * as path from "path";
import {Directory} from "../../../common/entities/Directory";
import {IGalleryManager} from "../IGalleryManager";
import {DiskManager} from "../DiskManger";
import {Utils} from "../../../common/Utils";
import {DirectoryModel} from "./entities/DirectoryModel";
import {PhotoModel} from "./entities/PhotoModel";
import {Photo} from "../../../common/entities/Photo";

export class MongoGalleryManager implements IGalleryManager {

    constructor() {
    }

    public listDirectory(relativeDirectoryName, cb:(error:any, result:Directory) => void) {
        let directoryName = path.basename(relativeDirectoryName);
        let directoryParent = path.join(path.dirname(relativeDirectoryName), "/");

        DirectoryModel.findOne({
            name: directoryName,
            path: directoryParent
        }).populate('photos').populate('directories').exec((err, res:any) => {
            if (err || !res) {
                return this.indexDirectory(relativeDirectoryName, cb);
            }
            return cb(err, this.modelToEntity(res));
        });

    }

    public indexDirectory(relativeDirectoryName, cb:(error:any, result:Directory) => void) {
        DiskManager.scanDirectory(relativeDirectoryName, (err, scannedDirectory)=> {
            let arr = [];
            scannedDirectory.directories.forEach((value) => {
                let dir = new DirectoryModel(value);
                Utils.setKeys(dir, value);
                dir.save();
                arr.push(dir);
            });
            scannedDirectory.directories = arr;
            arr = [];
            scannedDirectory.photos.forEach((value) => {
                let p = new PhotoModel(value);
                Utils.setKeys(p, value);
                p.save();
                arr.push(p);
            });

            scannedDirectory.photos = arr;
            DirectoryModel.create(scannedDirectory, (err, savedDir)=> {
                scannedDirectory.photos.forEach((value:any) => {
                    value['directory'] = savedDir;
                    value.save();
                });
                return cb(err, this.modelToEntity(scannedDirectory));
            });

        });
    }


    private modelToEntity(directroy:any):Directory {
        console.log("modelToEntity");
        //   console.log(directroy);
        let directoryEntity = new Directory(directroy._id);
        Utils.updateKeys(directoryEntity, directroy);
        directroy.photos.forEach((photo) => {
            let photoEntity = new Photo(null, null, null, null, null);
            Utils.updateKeys(photoEntity, photo);
            console.log(photoEntity);
            directoryEntity.photos.push(photoEntity);
        });
        directroy.directories.forEach((dir) => {
            let dirEntity = new Directory(null, null, null, null, null, null);
            Utils.updateKeys(dirEntity, dir);
            console.log(dir);
            console.log(dirEntity);
            directoryEntity.directories.push(dirEntity);
        });

        return directoryEntity;

    }
}