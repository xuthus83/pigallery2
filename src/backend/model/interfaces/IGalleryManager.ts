import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {OrientationType} from '../../../common/entities/RandomQueryDTO';

export interface RandomQuery {
  directory?: string;
  recursive?: boolean;
  orientation?: OrientationType;
  fromDate?: Date;
  toDate?: Date;
  minResolution?: number;
  maxResolution?: number;
}

export interface IGalleryManager {
  listDirectory(relativeDirectoryName: string,
                knownLastModified?: number,
                knownLastScanned?: number): Promise<DirectoryDTO>;

  getRandomPhoto(queryFilter: RandomQuery): Promise<PhotoDTO>;

}
