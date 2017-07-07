import {PhotoDTO} from "./PhotoDTO";

export interface DirectoryDTO {
  id: number;
  name: string;
  path: string;
  lastUpdate: number;
  parent: DirectoryDTO;
  directories: Array<DirectoryDTO>;
  photos: Array<PhotoDTO>;
}

export module DirectoryUtil {
  export const addReferences = (dir: DirectoryDTO) => {
    dir.photos.forEach((photo: PhotoDTO) => {
      photo.directory = dir;
    });

    dir.directories.forEach((directory: DirectoryDTO) => {
      addReferences(directory);
      directory.parent = dir;
    });
  }
}
