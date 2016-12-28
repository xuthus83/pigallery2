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