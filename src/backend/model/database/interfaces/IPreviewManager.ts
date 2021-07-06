import {SavedSearchDTO} from '../../../../common/entities/album/SavedSearchDTO';
import {PreviewPhotoDTO} from '../../../../common/entities/PhotoDTO';

export interface IPreviewManager {
  getPreviewForDirectory(dir: { id: number, name: string, path: string }): Promise<PreviewPhotoDTOWithID>;

  getAlbumPreview(album: SavedSearchDTO): Promise<PreviewPhotoDTOWithID>;
}

// ID is need within the backend so it can be saved to DB (ID is the external key)
export interface PreviewPhotoDTOWithID extends PreviewPhotoDTO {
  id: number;
}
