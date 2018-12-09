import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {IGalleryManager} from '../interfaces/IGalleryManager';

export interface ISQLGalleryManager extends IGalleryManager {
  listDirectory(relativeDirectoryName: string,
                knownLastModified?: number,
                knownLastScanned?: number): Promise<DirectoryDTO>;

  indexDirectory(relativeDirectoryName: string): Promise<DirectoryDTO>;

  countDirectories(): Promise<number>;

  countPhotos(): Promise<number>;

  countVideos(): Promise<number>;

  countMediaSize(): Promise<number>;
}
