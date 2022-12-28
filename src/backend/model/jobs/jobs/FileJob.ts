import {ConfigTemplateEntry} from '../../../../common/entities/job/JobDTO';
import {Job} from './Job';
import * as path from 'path';
import {DiskManager} from '../../DiskManger';
import {DirectoryScanSettings} from '../../threading/DiskMangerWorker';
import {Logger} from '../../../Logger';
import {Config} from '../../../../common/config/private/Config';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {SQLConnection} from '../../database/sql/SQLConnection';
import {MediaEntity} from '../../database/sql/enitites/MediaEntity';
import {PhotoEntity} from '../../database/sql/enitites/PhotoEntity';
import {VideoEntity} from '../../database/sql/enitites/VideoEntity';
import {backendTexts} from '../../../../common/BackendTexts';
import {ProjectPath} from '../../../ProjectPath';
import {DatabaseType} from '../../../../common/config/private/PrivateConfig';
import {FileEntity} from '../../database/sql/enitites/FileEntity';
import {DirectoryBaseDTO, DirectoryDTOUtils} from '../../../../common/entities/DirectoryDTO';

const LOG_TAG = '[FileJob]';

/**
 * Abstract class for thumbnail creation, file deleting etc.
 */
export abstract class FileJob<S extends { indexedOnly: boolean } = { indexedOnly: boolean }> extends Job<S> {
  public readonly ConfigTemplate: ConfigTemplateEntry[] = [];
  directoryQueue: string[] = [];
  fileQueue: string[] = [];
  DBProcessing = {
    mediaLoaded: 0,
    hasMoreMedia: true,
    initiated: false
  };


  protected constructor(private scanFilter: DirectoryScanSettings) {
    super();
    this.scanFilter.noChildDirPhotos = true;
    if (Config.Database.type !== DatabaseType.memory) {
      this.ConfigTemplate.push({
        id: 'indexedOnly',
        type: 'boolean',
        name: backendTexts.indexedFilesOnly.name,
        description: backendTexts.indexedFilesOnly.description,
        defaultValue: true,
      });
    }
  }

  protected async init(): Promise<void> {
    this.directoryQueue = [];
    this.fileQueue = [];
    this.DBProcessing = {
      mediaLoaded: 0,
      hasMoreMedia: true,
      initiated: false
    };
    this.directoryQueue.push('/');
  }

  protected async filterMediaFiles(files: FileDTO[]): Promise<FileDTO[]> {
    return files;
  }

  protected async filterMetaFiles(files: FileDTO[]): Promise<FileDTO[]> {
    return files;
  }

  protected abstract shouldProcess(filePath: string): Promise<boolean>;

  protected abstract processFile(filePath: string): Promise<void>;

  protected async step(): Promise<boolean> {
    const DBBased = this.config.indexedOnly &&
      Config.Database.type !== DatabaseType.memory;
    if (
      this.fileQueue.length === 0 &&
      ((this.directoryQueue.length === 0 && !DBBased) ||
        (DBBased &&
          this.DBProcessing.hasMoreMedia === false))) {
      return false;
    }

    const processOneFile = async () => {
      const filePath = this.fileQueue.shift();
      try {
        if ((await this.shouldProcess(filePath)) === true) {
          this.Progress.Processed++;
          this.Progress.log('processing: ' + filePath);
          await this.processFile(filePath);
        } else {
          this.Progress.log('skipping: ' + filePath);
          this.Progress.Skipped++;
        }
      } catch (e) {
        console.error(e);
        Logger.error(
          LOG_TAG,
          'Error during processing file:' + filePath + ', ' + e.toString()
        );
        this.Progress.log(
          'Error during processing file:' + filePath + ', ' + e.toString()
        );
      }
    };

    if (!DBBased) {
      if (this.directoryQueue.length > 0) {
        await this.loadADirectoryFromDisk();
      } else if (this.fileQueue.length > 0) {
        this.Progress.Left = this.fileQueue.length;
        await processOneFile();
      }
    } else {
      if (!this.DBProcessing.initiated) {
        this.Progress.log('Counting files from db');
        Logger.silly(LOG_TAG, 'Counting files from db');
        this.Progress.All = await this.countMediaFromDB();
        Logger.silly(LOG_TAG, 'Found:' + this.Progress.All);
        this.DBProcessing.initiated = true;
        return true;
      }
      if (this.fileQueue.length === 0) {
        await this.loadMediaFilesFromDB();
      } else {
        this.Progress.Left = this.fileQueue.length;
        await processOneFile();
      }
    }

    return true;
  }

  private async loadADirectoryFromDisk(): Promise<void> {
    const directory = this.directoryQueue.shift();
    this.Progress.log('scanning directory: ' + directory);
    const scanned = await DiskManager.scanDirectoryNoMetadata(
      directory,
      this.scanFilter
    );
    for (const item of scanned.directories) {
      this.directoryQueue.push(path.join(item.path, item.name));
    }
    DirectoryDTOUtils.addReferences(scanned as DirectoryBaseDTO);
    if (this.scanFilter.noPhoto !== true || this.scanFilter.noVideo !== true) {
      const scannedAndFiltered = await this.filterMediaFiles(scanned.media);
      for (const item of scannedAndFiltered) {
        this.fileQueue.push(
          path.join(
            ProjectPath.ImageFolder,
            item.directory.path,
            item.directory.name,
            item.name
          )
        );
      }
    }
    if (this.scanFilter.noMetaFile !== true) {
      const scannedAndFiltered = await this.filterMetaFiles(scanned.metaFile);
      for (const item of scannedAndFiltered) {
        this.fileQueue.push(
          path.join(
            ProjectPath.ImageFolder,
            item.directory.path,
            item.directory.name,
            item.name
          )
        );
      }
    }
  }

  private async loadMediaFilesFromDB(): Promise<void> {
    if (this.scanFilter.noVideo === true &&
      this.scanFilter.noPhoto === true &&
      this.scanFilter.noMetaFile === true) {
      return;
    }

    const logStr = `Loading next batch of files from db. Skipping: ${this.DBProcessing.mediaLoaded}, looking for more: ${Config.Jobs.mediaProcessingBatchSize}`;
    this.Progress.log(logStr);
    Logger.silly(LOG_TAG, logStr);

    const hasMoreFile = {
      media: false,
      metafile: false
    };
    const connection = await SQLConnection.getConnection();
    if (!this.scanFilter.noVideo ||
      !this.scanFilter.noPhoto) {

      let usedEntity = MediaEntity;

      if (this.scanFilter.noVideo === true) {
        usedEntity = PhotoEntity;
      } else if (this.scanFilter.noPhoto === true) {
        usedEntity = VideoEntity;
      }

      const result = await connection
        .getRepository(usedEntity)
        .createQueryBuilder('media')
        .select(['media.name', 'directory.name', 'directory.path'])
        .leftJoin('media.directory', 'directory')
        .offset(this.DBProcessing.mediaLoaded)
        .limit(Config.Jobs.mediaProcessingBatchSize)
        .getMany();

      hasMoreFile.media = result.length > 0;
      this.DBProcessing.mediaLoaded += result.length;
      const scannedAndFiltered = await this.filterMediaFiles(result);
      for (const item of scannedAndFiltered) {
        this.fileQueue.push(
          path.join(
            ProjectPath.ImageFolder,
            item.directory.path,
            item.directory.name,
            item.name
          )
        );
      }
    }
    if (!this.scanFilter.noMetaFile) {

      const result = await connection
        .getRepository(FileEntity)
        .createQueryBuilder('file')
        .select(['file.name', 'directory.name', 'directory.path'])
        .leftJoin('file.directory', 'directory')
        .offset(this.DBProcessing.mediaLoaded)
        .limit(Config.Jobs.mediaProcessingBatchSize)
        .getMany();


      hasMoreFile.metafile = result.length > 0;
      this.DBProcessing.mediaLoaded += result.length;
      const scannedAndFiltered = await this.filterMetaFiles(result);
      for (const item of scannedAndFiltered) {
        this.fileQueue.push(
          path.join(
            ProjectPath.ImageFolder,
            item.directory.path,
            item.directory.name,
            item.name
          )
        );
      }
    }
    this.DBProcessing.hasMoreMedia = hasMoreFile.media || hasMoreFile.metafile;
  }

  private async countMediaFromDB(): Promise<number> {
    if (this.scanFilter.noVideo === true &&
      this.scanFilter.noPhoto === true &&
      this.scanFilter.noMetaFile === true) {
      return;
    }
    let count = 0;
    const connection = await SQLConnection.getConnection();
    if (!this.scanFilter.noVideo ||
      !this.scanFilter.noPhoto) {

      let usedEntity = MediaEntity;

      if (this.scanFilter.noVideo === true) {
        usedEntity = PhotoEntity;
      } else if (this.scanFilter.noPhoto === true) {
        usedEntity = VideoEntity;
      }

      count += await connection
        .getRepository(usedEntity)
        .createQueryBuilder('media')
        .getCount();

      if (!this.scanFilter.noMetaFile) {

        count += await connection
          .getRepository(FileEntity)
          .createQueryBuilder('file')
          .getCount();

      }
      return count;
    }
  }
}
