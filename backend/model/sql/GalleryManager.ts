import {IGalleryManager, RandomQuery} from '../interfaces/IGalleryManager';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import * as path from 'path';
import * as fs from 'fs';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {SQLConnection} from './SQLConnection';
import {DiskManager} from '../DiskManger';
import {PhotoEntity, PhotoMetadataEntity} from './enitites/PhotoEntity';
import {Utils} from '../../../common/Utils';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ISQLGalleryManager} from './IGalleryManager';
import {DatabaseType, ReIndexingSensitivity} from '../../../common/config/private/IPrivateConfig';
import {FaceRegion, PhotoDTO, PhotoMetadata} from '../../../common/entities/PhotoDTO';
import {OrientationType} from '../../../common/entities/RandomQueryDTO';
import {Brackets, Connection, Transaction, TransactionRepository, Repository} from 'typeorm';
import {MediaEntity} from './enitites/MediaEntity';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {VideoEntity} from './enitites/VideoEntity';
import {FileEntity} from './enitites/FileEntity';
import {FileDTO} from '../../../common/entities/FileDTO';
import {NotificationManager} from '../NotifocationManager';
import {DiskMangerWorker} from '../threading/DiskMangerWorker';
import {Logger} from '../../Logger';
import {FaceRegionEntry} from './enitites/FaceRegionEntry';
import {PersonEntry} from './enitites/PersonEntry';

const LOG_TAG = '[GalleryManager]';

export class GalleryManager implements IGalleryManager, ISQLGalleryManager {

  private savingQueue: DirectoryDTO[] = [];
  private isSaving = false;

  protected async selectParentDir(connection: Connection, directoryName: string, directoryParent: string): Promise<DirectoryEntity> {
    const query = connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('directory')
      .where('directory.name = :name AND directory.path = :path', {
        name: directoryName,
        path: directoryParent
      })
      .leftJoinAndSelect('directory.directories', 'directories')
      .leftJoinAndSelect('directory.media', 'media');

    if (Config.Client.MetaFile.enabled === true) {
      query.leftJoinAndSelect('directory.metaFile', 'metaFile');
    }

    return await query.getOne();
  }

  protected async fillParentDir(connection: Connection, dir: DirectoryEntity): Promise<void> {
    if (dir.media) {
      const indexedFaces = await connection.getRepository(FaceRegionEntry)
        .createQueryBuilder('face')
        .leftJoinAndSelect('face.media', 'media')
        .where('media.directory = :directory', {
          directory: dir.id
        })
        .leftJoinAndSelect('face.person', 'person')
        .getMany();
      for (let i = 0; i < dir.media.length; i++) {
        dir.media[i].directory = dir;
        dir.media[i].readyThumbnails = [];
        dir.media[i].readyIcon = false;
        (<PhotoDTO>dir.media[i]).metadata.faces = indexedFaces
          .filter(fe => fe.media.id === dir.media[i].id)
          .map(f => ({box: f.box, name: f.person.name}));
      }

    }
    if (dir.directories) {
      for (let i = 0; i < dir.directories.length; i++) {
        dir.directories[i].media = await connection
          .getRepository(MediaEntity)
          .createQueryBuilder('media')
          .where('media.directory = :dir', {
            dir: dir.directories[i].id
          })
          .orderBy('media.metadata.creationDate', 'ASC')
          .limit(Config.Server.indexing.folderPreviewSize)
          .getMany();
        dir.directories[i].isPartial = true;

        for (let j = 0; j < dir.directories[i].media.length; j++) {
          dir.directories[i].media[j].directory = dir.directories[i];
          dir.directories[i].media[j].readyThumbnails = [];
          dir.directories[i].media[j].readyIcon = false;
        }
      }
    }
  }


  public async listDirectory(relativeDirectoryName: string,
                             knownLastModified?: number,
                             knownLastScanned?: number): Promise<DirectoryDTO> {

    relativeDirectoryName = DiskMangerWorker.normalizeDirPath(relativeDirectoryName);
    const directoryName = path.basename(relativeDirectoryName);
    const directoryParent = path.join(path.dirname(relativeDirectoryName), path.sep);
    const connection = await SQLConnection.getConnection();
    const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
    const lastModified = DiskMangerWorker.calcLastModified(stat);


    const dir = await this.selectParentDir(connection, directoryName, directoryParent);
    if (dir && dir.lastScanned != null) {
      // If it seems that the content did not changed, do not work on it
      if (knownLastModified && knownLastScanned
        && lastModified === knownLastModified &&
        dir.lastScanned === knownLastScanned) {
        if (Config.Server.indexing.reIndexingSensitivity === ReIndexingSensitivity.low) {
          return null;
        }
        if (Date.now() - dir.lastScanned <= Config.Server.indexing.cachedFolderTimeout &&
          Config.Server.indexing.reIndexingSensitivity === ReIndexingSensitivity.medium) {
          return null;
        }
      }


      if (dir.lastModified !== lastModified) {
        Logger.silly(LOG_TAG, 'Reindexing reason: lastModified mismatch: known: '
          + dir.lastModified + ', current:' + lastModified);
        return this.indexDirectory(relativeDirectoryName);
      }


      // not indexed since a while, index it in a lazy manner
      if ((Date.now() - dir.lastScanned > Config.Server.indexing.cachedFolderTimeout &&
        Config.Server.indexing.reIndexingSensitivity >= ReIndexingSensitivity.medium) ||
        Config.Server.indexing.reIndexingSensitivity >= ReIndexingSensitivity.high) {
        // on the fly reindexing

        Logger.silly(LOG_TAG, 'lazy reindexing reason: cache timeout: lastScanned: '
          + (Date.now() - dir.lastScanned) + ', cachedFolderTimeout:' + Config.Server.indexing.cachedFolderTimeout);
        this.indexDirectory(relativeDirectoryName).catch((err) => {
          console.error(err);
        });
      }
      await this.fillParentDir(connection, dir);
      return dir;
    }

    // never scanned (deep indexed), do it and return with it
    Logger.silly(LOG_TAG, 'Reindexing reason: never scanned');
    return this.indexDirectory(relativeDirectoryName);


  }


  public indexDirectory(relativeDirectoryName: string): Promise<DirectoryDTO> {
    return new Promise(async (resolve, reject) => {
      try {
        const scannedDirectory = await DiskManager.scanDirectory(relativeDirectoryName);

        // returning with the result
        scannedDirectory.media.forEach(p => p.readyThumbnails = []);
        resolve(scannedDirectory);

        this.queueForSave(scannedDirectory).catch(console.error);

      } catch (error) {
        NotificationManager.warning('Unknown indexing error for: ' + relativeDirectoryName, error.toString());
        console.error(error);
        return reject(error);
      }

    });
  }


  public async getRandomPhoto(queryFilter: RandomQuery): Promise<PhotoDTO> {
    const connection = await SQLConnection.getConnection();
    const photosRepository = connection.getRepository(PhotoEntity);
    const query = photosRepository.createQueryBuilder('photo');
    query.innerJoinAndSelect('photo.directory', 'directory');

    if (queryFilter.directory) {
      const directoryName = path.basename(queryFilter.directory);
      const directoryParent = path.join(path.dirname(queryFilter.directory), path.sep);

      query.where(new Brackets(qb => {
        qb.where('directory.name = :name AND directory.path = :path', {
          name: directoryName,
          path: directoryParent
        });

        if (queryFilter.recursive) {
          qb.orWhere('directory.name LIKE :text COLLATE utf8_general_ci', {text: '%' + queryFilter.directory + '%'});
        }
      }));
    }

    if (queryFilter.fromDate) {
      query.andWhere('photo.metadata.creationDate >= :fromDate', {
        fromDate: queryFilter.fromDate.getTime()
      });
    }
    if (queryFilter.toDate) {
      query.andWhere('photo.metadata.creationDate <= :toDate', {
        toDate: queryFilter.toDate.getTime()
      });
    }
    if (queryFilter.minResolution) {
      query.andWhere('photo.metadata.size.width * photo.metadata.size.height >= :minRes', {
        minRes: queryFilter.minResolution * 1000 * 1000
      });
    }

    if (queryFilter.maxResolution) {
      query.andWhere('photo.metadata.size.width * photo.metadata.size.height <= :maxRes', {
        maxRes: queryFilter.maxResolution * 1000 * 1000
      });
    }
    if (queryFilter.orientation === OrientationType.landscape) {
      query.andWhere('photo.metadata.size.width >= photo.metadata.size.height');
    }
    if (queryFilter.orientation === OrientationType.portrait) {
      query.andWhere('photo.metadata.size.width <= photo.metadata.size.height');
    }

    if (Config.Server.database.type === DatabaseType.mysql) {
      return await query.groupBy('RAND(), photo.id').limit(1).getOne();
    }
    return await query.groupBy('RANDOM()').limit(1).getOne();

  }

  // Todo fix it, once typeorm support connection pools ofr sqlite
  protected async queueForSave(scannedDirectory: DirectoryDTO) {
    if (this.savingQueue.findIndex(dir => dir.name === scannedDirectory.name &&
      dir.path === scannedDirectory.path &&
      dir.lastModified === scannedDirectory.lastModified &&
      dir.lastScanned === scannedDirectory.lastScanned &&
      (dir.media || dir.media.length) === (scannedDirectory.media || scannedDirectory.media.length) &&
      (dir.metaFile || dir.metaFile.length) === (scannedDirectory.metaFile || scannedDirectory.metaFile.length)) !== -1) {
      return;
    }
    this.savingQueue.push(scannedDirectory);
    while (this.isSaving === false && this.savingQueue.length > 0) {
      await this.saveToDB(this.savingQueue[0]);
      this.savingQueue.shift();
    }

  }

  protected async saveToDB(scannedDirectory: DirectoryDTO) {
    console.log('saving');
    this.isSaving = true;
    try {
      const connection = await SQLConnection.getConnection();

      // saving to db
      const directoryRepository = connection.getRepository(DirectoryEntity);
      const mediaRepository = connection.getRepository(MediaEntity);
      const fileRepository = connection.getRepository(FileEntity);


      let currentDir: DirectoryEntity = await directoryRepository.createQueryBuilder('directory')
        .where('directory.name = :name AND directory.path = :path', {
          name: scannedDirectory.name,
          path: scannedDirectory.path
        }).getOne();
      if (!!currentDir) {// Updated parent dir (if it was in the DB previously)
        currentDir.lastModified = scannedDirectory.lastModified;
        currentDir.lastScanned = scannedDirectory.lastScanned;
        currentDir.mediaCount = scannedDirectory.mediaCount;
        currentDir = await directoryRepository.save(currentDir);
      } else {
        currentDir = await directoryRepository.save(<DirectoryEntity>scannedDirectory);
      }

      // TODO: fix when first opened directory is not root
      // save subdirectories
      const childDirectories = await directoryRepository.createQueryBuilder('directory')
        .where('directory.parent = :dir', {
          dir: currentDir.id
        }).getMany();

      for (let i = 0; i < scannedDirectory.directories.length; i++) {
        // Was this child Dir already indexed before?
        let directory: DirectoryEntity = null;
        for (let j = 0; j < childDirectories.length; j++) {
          if (childDirectories[j].name === scannedDirectory.directories[i].name) {
            directory = childDirectories[j];
            childDirectories.splice(j, 1);
            break;
          }
        }

        if (directory != null) { // update existing directory
          if (!directory.parent || !directory.parent.id) { // set parent if not set yet
            directory.parent = currentDir;
            delete directory.media;
            await directoryRepository.save(directory);
          }
        } else { // dir does not exists yet
          scannedDirectory.directories[i].parent = currentDir;
          (<DirectoryEntity>scannedDirectory.directories[i]).lastScanned = null; // new child dir, not fully scanned yet
          const d = await directoryRepository.save(<DirectoryEntity>scannedDirectory.directories[i]);
          for (let j = 0; j < scannedDirectory.directories[i].media.length; j++) {
            scannedDirectory.directories[i].media[j].directory = d;
          }

          await this.saveMedia(connection, scannedDirectory.directories[i].media);
        }
      }

      // Remove child Dirs that are not anymore in the parent dir
      await directoryRepository.remove(childDirectories, {chunk: Math.max(Math.ceil(childDirectories.length / 500), 1)});

      // save media
      const indexedMedia = (await mediaRepository.createQueryBuilder('media')
        .where('media.directory = :dir', {
          dir: currentDir.id
        })
        .getMany());


      const mediaToSave = [];
      for (let i = 0; i < scannedDirectory.media.length; i++) {
        let media: MediaDTO = null;
        for (let j = 0; j < indexedMedia.length; j++) {
          if (indexedMedia[j].name === scannedDirectory.media[i].name) {
            media = indexedMedia[j];
            indexedMedia.splice(j, 1);
            break;
          }
        }


        if (media == null) { // not in DB yet
          scannedDirectory.media[i].directory = null;
          media = Utils.clone(scannedDirectory.media[i]);
          scannedDirectory.media[i].directory = scannedDirectory;
          media.directory = currentDir;
          mediaToSave.push(media);
        } else {
          delete (<PhotoMetadata>media.metadata).faces;

          if (!Utils.equalsFilter(media.metadata, scannedDirectory.media[i].metadata)) {
            media.metadata = scannedDirectory.media[i].metadata;
            mediaToSave.push(media);
          }
        }
        const scannedFaces = (<PhotoMetadata>scannedDirectory.media[i].metadata).faces;
        delete (<PhotoMetadata>scannedDirectory.media[i].metadata).faces;

        const mediaEntry = await this.saveAMedia(connection, media);

        await this.saveFaces(connection, mediaEntry, scannedFaces);
      }
      // await this.saveMedia(connection, mediaToSave);
      await mediaRepository.remove(indexedMedia);


      // save files
      const indexedMetaFiles = await fileRepository.createQueryBuilder('file')
        .where('file.directory = :dir', {
          dir: currentDir.id
        }).getMany();


      const metaFilesToSave = [];
      for (let i = 0; i < scannedDirectory.metaFile.length; i++) {
        let metaFile: FileDTO = null;
        for (let j = 0; j < indexedMetaFiles.length; j++) {
          if (indexedMetaFiles[j].name === scannedDirectory.metaFile[i].name) {
            metaFile = indexedMetaFiles[j];
            indexedMetaFiles.splice(j, 1);
            break;
          }
        }
        if (metaFile == null) { // not in DB yet
          scannedDirectory.metaFile[i].directory = null;
          metaFile = Utils.clone(scannedDirectory.metaFile[i]);
          scannedDirectory.metaFile[i].directory = scannedDirectory;
          metaFile.directory = currentDir;
          metaFilesToSave.push(metaFile);
        }
      }
      await fileRepository.save(metaFilesToSave, {chunk: Math.max(Math.ceil(metaFilesToSave.length / 500), 1)});
      await fileRepository.remove(indexedMetaFiles, {chunk: Math.max(Math.ceil(indexedMetaFiles.length / 500), 1)});
    } catch (e) {
      throw e;
    } finally {
      this.isSaving = false;
    }
  }

  protected async saveFaces(connection: Connection, media: MediaEntity, scannedFaces: FaceRegion[]) {

    const faceRepository = connection.getRepository(FaceRegionEntry);
    const personRepository = connection.getRepository(PersonEntry);
    const indexedPersons = await personRepository.createQueryBuilder('person').getMany();

    const indexedFaces = await faceRepository.createQueryBuilder('face')
      .where('face.media = :media', {
        media: media.id
      })
      .leftJoinAndSelect('face.person', 'person')
      .getMany();


    const getPerson = async (name: string) => {
      let person = indexedPersons.find(p => p.name === name);
      if (!person) {
        person = <any>await personRepository.save({name: name});
        indexedPersons.push(person);
      }
      return person;
    };

    const faceToSave = [];
    for (let i = 0; i < scannedFaces.length; i++) {
      let face: FaceRegionEntry = null;
      for (let j = 0; j < indexedFaces.length; j++) {
        if (indexedFaces[j].box.height === scannedFaces[i].box.height &&
          indexedFaces[j].box.width === scannedFaces[i].box.width &&
          indexedFaces[j].box.x === scannedFaces[i].box.x &&
          indexedFaces[j].box.y === scannedFaces[i].box.y &&
          indexedFaces[j].person.name === scannedFaces[i].name) {
          face = indexedFaces[j];
          indexedFaces.splice(j, 1);
          break;
        }
      }

      if (face == null) {
        (<FaceRegionEntry>scannedFaces[i]).person = await getPerson(scannedFaces[i].name);
        (<FaceRegionEntry>scannedFaces[i]).media = media;
        //   console.log('inserting', (<FaceRegionEntry>scannedFaces[i]).person, (<FaceRegionEntry>scannedFaces[i]).media);
        //  console.log('inserting', (<FaceRegionEntry>scannedFaces[i]).person.id, (<FaceRegionEntry>scannedFaces[i]).media.id);
        faceToSave.push(scannedFaces[i]);
      }
    }
    await faceRepository.save(faceToSave, {chunk: Math.max(Math.ceil(faceToSave.length / 500), 1)});
    await faceRepository.remove(indexedFaces, {chunk: Math.max(Math.ceil(indexedFaces.length / 500), 1)});

  }

  protected async saveAMedia(connection: Connection, media: MediaDTO): Promise<MediaEntity> {
    if (MediaDTO.isPhoto(media)) {
      return await <any>connection.getRepository(PhotoEntity).save(media);
    }
    return await <any>connection.getRepository(VideoEntity).save(media);
  }

  protected async saveMedia(connection: Connection, mediaList: MediaDTO[]): Promise<MediaEntity[]> {
    const chunked = Utils.chunkArrays(mediaList, 100);
    let list: MediaEntity[] = [];
    for (let i = 0; i < chunked.length; i++) {
      list = list.concat(await connection.getRepository(PhotoEntity).save(<PhotoEntity[]>chunked[i].filter(m => MediaDTO.isPhoto(m))));
      list = list.concat(await connection.getRepository(VideoEntity).save(<VideoEntity[]>chunked[i].filter(m => MediaDTO.isVideo(m))));
    }
    return list;
  }

  async countDirectories(): Promise<number> {
    const connection = await SQLConnection.getConnection();
    return await connection.getRepository(DirectoryEntity)
      .createQueryBuilder('directory')
      .getCount();
  }

  async countMediaSize(): Promise<number> {
    const connection = await SQLConnection.getConnection();
    const {sum} = await connection.getRepository(MediaEntity)
      .createQueryBuilder('media')
      .select('SUM(media.metadata.fileSize)', 'sum')
      .getRawOne();
    return sum;
  }

  async countPhotos(): Promise<number> {
    const connection = await SQLConnection.getConnection();
    return await connection.getRepository(PhotoEntity)
      .createQueryBuilder('directory')
      .getCount();
  }

  async countVideos(): Promise<number> {
    const connection = await SQLConnection.getConnection();
    return await connection.getRepository(VideoEntity)
      .createQueryBuilder('directory')
      .getCount();
  }


}
