import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {IGalleryManager} from '../interfaces/IGalleryManager';
import {DuplicatesDTO} from '../../../../common/entities/DuplicatesDTO';
import {Connection} from 'typeorm';
import {DirectoryEntity} from './enitites/DirectoryEntity';

export interface ISQLGalleryManager extends IGalleryManager {
  listDirectory(relativeDirectoryName: string,
                knownLastModified?: number,
                knownLastScanned?: number): Promise<DirectoryDTO>;

  countDirectories(): Promise<number>;

  countPhotos(): Promise<number>;

  countVideos(): Promise<number>;

  countMediaSize(): Promise<number>;

  getPossibleDuplicates(): Promise<DuplicatesDTO[]>;

  selectDirStructure(directory: string): Promise<DirectoryDTO>;

  fillPreviewForSubDir(connection: Connection, dir: DirectoryEntity): Promise<void>;
}
