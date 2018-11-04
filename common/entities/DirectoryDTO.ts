import {MediaDTO} from './MediaDTO';

export interface DirectoryDTO {
  id: number;
  name: string;
  path: string;
  lastModified: number;
  lastScanned: number;
  isPartial?: boolean;
  parent: DirectoryDTO;
  directories: Array<DirectoryDTO>;
  media: MediaDTO[];
}

export module DirectoryDTO {
  export const addReferences = (dir: DirectoryDTO): void => {
    dir.media.forEach((photo: MediaDTO) => {
      photo.directory = dir;
    });

    dir.directories.forEach((directory: DirectoryDTO) => {
      addReferences(directory);
      directory.parent = dir;
    });
  };
}
