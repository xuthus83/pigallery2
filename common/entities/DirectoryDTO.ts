import {MediaDTO} from './MediaDTO';
import {PhotoDTO} from './PhotoDTO';

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
    dir.media.forEach((media: MediaDTO) => {
      media.directory = dir;
    });

    dir.directories.forEach((directory: DirectoryDTO) => {
      addReferences(directory);
      directory.parent = dir;
    });
  };

  export const removeReferences = (dir: DirectoryDTO): void => {
    dir.media.forEach((media: MediaDTO) => {
      media.directory = null;
    });

    if (dir.directories) {
      dir.directories.forEach((directory: DirectoryDTO) => {
        removeReferences(directory);
        directory.parent = null;
      });
    }

  };
}
