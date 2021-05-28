import {SearchQueryDTO} from '../../../../common/entities/SearchQueryDTO';
import {AlbumBaseDTO} from '../../../../common/entities/album/AlbumBaseDTO';

export interface IAlbumManager {
  /**
   * Creates a saved search type of album
   */
  addSavedSearch(name: string, searchQuery: SearchQueryDTO): Promise<void>;

  /**
   * Deletes an album
   */
  deleteAlbum(id: number): Promise<void>;

  /**
   * Returns with all albums
   */
  getAlbums(): Promise<AlbumBaseDTO[]>;
}
