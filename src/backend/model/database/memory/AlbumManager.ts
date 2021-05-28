import {AlbumBaseDTO} from '../../../../common/entities/album/AlbumBaseDTO';
import {SearchQueryDTO} from '../../../../common/entities/SearchQueryDTO';
import {IAlbumManager} from '../interfaces/IAlbumManager';

export class AlbumManager implements IAlbumManager {

  public async addSavedSearch(name: string, searchQuery: SearchQueryDTO): Promise<void> {
    throw new Error('not supported by memory DB');

  }

  public async deleteAlbum(id: number): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  public async getAlbums(): Promise<AlbumBaseDTO[]> {
    throw new Error('not supported by memory DB');
  }
}
