import {IGalleryManager, RandomQuery} from '../interfaces/IGalleryManager';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import * as path from 'path';
import * as fs from 'fs';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {SQLConnection} from './SQLConnection';
import {DiskManager} from '../DiskManger';
import {PhotoEntity} from './enitites/PhotoEntity';
import {Utils} from '../../../common/Utils';
import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import {ISQLGalleryManager} from './IGalleryManager';
import {ReIndexingSensitivity} from '../../../common/config/private/IPrivateConfig';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {OrientationType} from '../../../common/entities/RandomQueryDTO';
import {Connection, Brackets} from 'typeorm';
import {MediaEntity} from './enitites/MediaEntity';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {VideoEntity} from './enitites/VideoEntity';

export class GalleryManager implements IGalleryManager, ISQLGalleryManager {


  public async listDirectory(relativeDirectoryName: string,
                             knownLastModified?: number,
                             knownLastScanned?: number): Promise<DirectoryDTO> {
    relativeDirectoryName = path.normalize(path.join('.' + path.sep, relativeDirectoryName));
    const directoryName = path.basename(relativeDirectoryName);
    const directoryParent = path.join(path.dirname(relativeDirectoryName), path.sep);
    const connection = await SQLConnection.getConnection();
    const stat = fs.statSync(path.join(ProjectPath.ImageFolder, relativeDirectoryName));
    const lastModified = Math.max(stat.ctime.getTime(), stat.mtime.getTime());
    const dir = await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('directory')
      .where('directory.name = :name AND directory.path = :path', {
        name: directoryName,
        path: directoryParent
      })
      .leftJoinAndSelect('directory.directories', 'directories')
      .leftJoinAndSelect('directory.media', 'media')
      .getOne();


    if (dir && dir.lastScanned != null) {
      // If it seems that the content did not changed, do not work on it
      if (knownLastModified && knownLastScanned
        && lastModified === knownLastModified &&
        dir.lastScanned === knownLastScanned) {

        if (Config.Server.indexing.reIndexingSensitivity === ReIndexingSensitivity.low) {
          return null;
        }
        if (Date.now() - knownLastScanned <= Config.Server.indexing.cachedFolderTimeout &&
          Config.Server.indexing.reIndexingSensitivity === ReIndexingSensitivity.medium) {
          return null;
        }
      }
      if (dir.media) {
        for (let i = 0; i < dir.media.length; i++) {
          dir.media[i].directory = dir;
          dir.media[i].readyThumbnails = [];
          dir.media[i].readyIcon = false;
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


      if (dir.lastModified !== lastModified) {
        return this.indexDirectory(relativeDirectoryName);
      }

      // not indexed since a while, index it in a lazy manner
      if ((Date.now() - dir.lastScanned > Config.Server.indexing.cachedFolderTimeout &&
        Config.Server.indexing.reIndexingSensitivity >= ReIndexingSensitivity.medium) ||
        Config.Server.indexing.reIndexingSensitivity >= ReIndexingSensitivity.high) {
        // on the fly reindexing
        this.indexDirectory(relativeDirectoryName).catch((err) => {
          console.error(err);
        });
      }
      return dir;


    }

    // never scanned (deep indexed), do it and return with it
    return this.indexDirectory(relativeDirectoryName);


  }


  public indexDirectory(relativeDirectoryName): Promise<DirectoryDTO> {
    return new Promise(async (resolve, reject) => {
      try {
        const scannedDirectory = await DiskManager.scanDirectory(relativeDirectoryName);

        // returning with the result
        scannedDirectory.media.forEach(p => p.readyThumbnails = []);
        resolve(scannedDirectory);

        await this.saveToDB(scannedDirectory);

      } catch (error) {
        console.error(error);
        return reject(error);
      }

    });
  }


  private async saveToDB(scannedDirectory: DirectoryDTO) {
    const connection = await SQLConnection.getConnection();

    // saving to db
    const directoryRepository = connection.getRepository(DirectoryEntity);
    const mediaRepository = connection.getRepository(MediaEntity);


    let currentDir: DirectoryEntity = await directoryRepository.createQueryBuilder('directory')
      .where('directory.name = :name AND directory.path = :path', {
        name: scannedDirectory.name,
        path: scannedDirectory.path
      }).getOne();

    if (!!currentDir) {// Updated parent dir (if it was in the DB previously)
      currentDir.lastModified = scannedDirectory.lastModified;
      currentDir.lastScanned = scannedDirectory.lastScanned;
      const media: MediaEntity[] = currentDir.media;
      delete currentDir.media;
      currentDir = await directoryRepository.save(currentDir);
      if (media) {
        media.forEach(m => m.directory = currentDir);
        currentDir.media = await this.saveMedia(connection, media);
      }
    } else {
      const media = scannedDirectory.media;
      delete scannedDirectory.media;
      (<DirectoryEntity>scannedDirectory).lastScanned = scannedDirectory.lastScanned;
      currentDir = await directoryRepository.save(<DirectoryEntity>scannedDirectory);
      if (media) {
        media.forEach(m => m.directory = currentDir);
        currentDir.media = await this.saveMedia(connection, media);
      }
    }

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
      } else {
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
    await directoryRepository.remove(childDirectories);


    const indexedMedia = await mediaRepository.createQueryBuilder('media')
      .where('media.directory = :dir', {
        dir: currentDir.id
      }).getMany();


    const mediaToSave = [];
    for (let i = 0; i < scannedDirectory.media.length; i++) {
      let media = null;
      for (let j = 0; j < indexedMedia.length; j++) {
        if (indexedMedia[j].name === scannedDirectory.media[i].name) {
          media = indexedMedia[j];
          indexedMedia.splice(j, 1);
          break;
        }
      }
      if (media == null) {
        scannedDirectory.media[i].directory = null;
        media = Utils.clone(scannedDirectory.media[i]);
        scannedDirectory.media[i].directory = scannedDirectory;
        media.directory = currentDir;
      }


      if (!Utils.equalsFilter(media.metadata, scannedDirectory.media[i].metadata)) {
        media.metadata = (<PhotoDTO>scannedDirectory.media[i]).metadata;
        mediaToSave.push(media);
      }
    }
    await this.saveMedia(connection, mediaToSave);
    await mediaRepository.remove(indexedMedia);
  }

  private async saveMedia(connection: Connection, mediaList: MediaDTO[]): Promise<MediaEntity[]> {
    const list = await connection.getRepository(VideoEntity).save(<VideoEntity[]>mediaList.filter(m => MediaDTO.isVideo(m)));
    return list.concat(await connection.getRepository(PhotoEntity).save(<PhotoEntity[]>mediaList.filter(m => MediaDTO.isPhoto(m))));
  }

  async getRandomPhoto(queryFilter: RandomQuery): Promise<PhotoDTO> {
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
      query.andWhere('media.metadata.creationDate >= :fromDate', {
        fromDate: queryFilter.fromDate.getTime()
      });
    }
    if (queryFilter.toDate) {
      query.andWhere('media.metadata.creationDate <= :toDate', {
        toDate: queryFilter.toDate.getTime()
      });
    }
    if (queryFilter.minResolution) {
      query.andWhere('media.metadata.size.width * media.metadata.size.height >= :minRes', {
        minRes: queryFilter.minResolution * 1000 * 1000
      });
    }

    if (queryFilter.maxResolution) {
      query.andWhere('media.metadata.size.width * media.metadata.size.height <= :maxRes', {
        maxRes: queryFilter.maxResolution * 1000 * 1000
      });
    }
    if (queryFilter.orientation === OrientationType.landscape) {
      query.andWhere('media.metadata.size.width >= media.metadata.size.height');
    }
    if (queryFilter.orientation === OrientationType.portrait) {
      query.andWhere('media.metadata.size.width <= media.metadata.size.height');
    }


    return await query.groupBy('RANDOM()').limit(1).getOne();

  }


}
