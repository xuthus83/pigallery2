import {MediaDTO} from './MediaDTO';
import {FileDTO} from './FileDTO';

export interface DirectoryDTO<S extends FileDTO = MediaDTO> {
  id: number;
  name: string;
  path: string;
  lastModified: number;
  lastScanned: number;
  isPartial?: boolean;
  parent: DirectoryDTO<S>;
  mediaCount: number;
  directories: DirectoryDTO<S>[];
  media: S[];
  metaFile: FileDTO[];
}

export module DirectoryDTO {
  export const addReferences = (dir: DirectoryDTO): void => {
    dir.media.forEach((media: MediaDTO) => {
      media.directory = dir;
    });

    if (dir.metaFile) {
      dir.metaFile.forEach((file: FileDTO) => {
        file.directory = dir;
      });
    }

    if (dir.directories) {
      dir.directories.forEach((directory: DirectoryDTO) => {
        addReferences(directory);
        directory.parent = dir;
      });
    }
  };

  export const removeReferences = (dir: DirectoryDTO): void => {
    if (dir.media) {
      dir.media.forEach((media: MediaDTO) => {
        media.directory = null;
      });
    }
    if (dir.metaFile) {
      dir.metaFile.forEach((file: FileDTO) => {
        file.directory = null;
      });
    }
    if (dir.directories) {
      dir.directories.forEach((directory: DirectoryDTO) => {
        removeReferences(directory);
        directory.parent = null;
      });
    }

  };
}
