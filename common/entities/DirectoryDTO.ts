import {PhotoDTO} from "./PhotoDTO";

export interface DirectoryDTO {
  id: number;
  name: string;
  path: string;
  lastModified: number;
  lastScanned: number;
  parent: DirectoryDTO;
  directories: Array<DirectoryDTO>;
  photos: Array<PhotoDTO>;
}

export module DirectoryDTO {
  export const addReferences = (dir: DirectoryDTO): void => {
    dir.photos.forEach((photo: PhotoDTO) => {
      photo.directory = dir;
    });

    dir.directories.forEach((directory: DirectoryDTO) => {
      addReferences(directory);
      directory.parent = dir;
    });
  }
}
