import {IGalleryManager} from "../interfaces/IGalleryManager";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import * as path from "path";
import {DirectoryEntity} from "./enitites/DirectoryEntity";
import {MySQLConnection} from "./MySQLConnection";
import {DiskManager} from "../DiskManger";
import {PhotoEntity} from "./enitites/PhotoEntity";
import {Utils} from "../../../common/Utils";
import {ProjectPath} from "../../ProjectPath";

export class GalleryManager implements IGalleryManager {


    public listDirectory(relativeDirectoryName, cb: (error: any, result: DirectoryDTO) => void) {
        relativeDirectoryName = path.normalize(path.join("." + path.sep, relativeDirectoryName));
        let directoryName = path.basename(relativeDirectoryName);
        let directoryParent = path.join(path.dirname(relativeDirectoryName), path.sep);
        console.log("GalleryManager:listDirectory");
        console.log(directoryName, directoryParent, path.dirname(relativeDirectoryName), ProjectPath.normalizeRelative(path.dirname(relativeDirectoryName)));
        MySQLConnection.getConnection().then(async connection => {

            let dir = await connection
                .getRepository(DirectoryEntity)
                .createQueryBuilder("directory")
                .where("directory.name = :name AND directory.path = :path", {
                    name: directoryName,
                    path: directoryParent
                })
                .leftJoinAndSelect("directory.directories", "directories")
                .leftJoinAndSelect("directory.photos", "photos")
                .getOne();

            if (dir && dir.scanned == true) {
                if (dir.photos) {
                    for (let i = 0; i < dir.photos.length; i++) {
                        dir.photos[i].directory = dir;
                        dir.photos[i].metadata.keywords = <any>JSON.parse(<any>dir.photos[i].metadata.keywords);
                        dir.photos[i].metadata.cameraData = <any>JSON.parse(<any>dir.photos[i].metadata.cameraData);
                        dir.photos[i].metadata.positionData = <any>JSON.parse(<any>dir.photos[i].metadata.positionData);
                        dir.photos[i].metadata.size = <any>JSON.parse(<any>dir.photos[i].metadata.size);
                    }
                }

                cb(null, dir); //WARNING: only on the fly indexing should happen after this point

                //on the fly updating
                return this.indexDirectory(relativeDirectoryName, cb);
            }
            return this.indexDirectory(relativeDirectoryName, cb);


        }).catch((error) => {
            return cb(error, null);
        });


    }

    public indexDirectory(relativeDirectoryName, cb: (error: any, result: DirectoryDTO) => void) {
        DiskManager.scanDirectory(relativeDirectoryName, (err, scannedDirectory) => {
            MySQLConnection.getConnection().then(async connection => {

                let directoryRepository = connection.getRepository(DirectoryEntity);
                let photosRepository = connection.getRepository(PhotoEntity);


                let parentDir = await directoryRepository.createQueryBuilder("directory")
                    .where("directory.name = :name AND directory.path = :path", {
                        name: scannedDirectory.name,
                        path: scannedDirectory.path
                    }).getOne();

                if (!!parentDir) {
                    parentDir.scanned = true;
                    parentDir.lastUpdate = Date.now();
                    parentDir = await directoryRepository.persist(parentDir);
                } else {
                    (<DirectoryEntity>scannedDirectory).scanned = true;
                    parentDir = await directoryRepository.persist(<DirectoryEntity>scannedDirectory);
                }

                for (let i = 0; i < scannedDirectory.directories.length; i++) {
                    if ((await directoryRepository.createQueryBuilder("directory")
                            .where("directory.name = :name AND directory.path = :path", {
                                name: scannedDirectory.directories[i].name,
                                path: scannedDirectory.directories[i].path
                            }).getCount()) > 0) {
                        continue;
                    }
                    scannedDirectory.directories[i].parent = parentDir;
                    (<DirectoryEntity>scannedDirectory.directories[i]).scanned = false;
                    await directoryRepository.persist(<DirectoryEntity>scannedDirectory.directories[i]);
                }

                for (let i = 0; i < scannedDirectory.photos.length; i++) {
                    //TODO: load as batch
                    if ((await photosRepository.createQueryBuilder("photo")
                            .where("photo.name = :name AND photo.directory = :dir", {
                                name: scannedDirectory.photos[i].name,
                                dir: parentDir.id
                            }).getCount()) > 0) {
                        continue;
                    }
                    //typeorm not supports recursive embended: TODO:fix it
                    scannedDirectory.photos[i].directory = null;
                    let photo = Utils.clone(scannedDirectory.photos[i]);
                    scannedDirectory.photos[i].directory = scannedDirectory;
                    photo.directory = parentDir;
                    photo.metadata.keywords = <any>JSON.stringify(photo.metadata.keywords);
                    photo.metadata.cameraData = <any>JSON.stringify(photo.metadata.cameraData);
                    photo.metadata.positionData = <any>JSON.stringify(photo.metadata.positionData);
                    photo.metadata.size = <any>JSON.stringify(photo.metadata.size);
                    await photosRepository.persist(photo);
                }

                return cb(null, scannedDirectory);


            }).catch((error) => {
                return cb(error, null);
            });
        });
    }

}