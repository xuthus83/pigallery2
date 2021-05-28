import {PreviewPhotoDTO} from '../PhotoDTO';

export interface AlbumBaseDTO {
  id: number;
  name: string;
  preview: PreviewPhotoDTO;
}
