import {SQLConnection} from './SQLConnection';
import {AlbumBaseEntity} from './enitites/album/AlbumBaseEntity';
import {AlbumBaseDTO} from '../../../../common/entities/album/AlbumBaseDTO';
import {SavedSearchDTO} from '../../../../common/entities/album/SavedSearchDTO';
import {ObjectManagers} from '../../ObjectManagers';
import {ISQLSearchManager} from './ISearchManager';
import {SearchQueryDTO} from '../../../../common/entities/SearchQueryDTO';
import {SavedSearchEntity} from './enitites/album/SavedSearchEntity';
import { IAlbumManager } from '../interfaces/IAlbumManager';

export class AlbumManager implements IAlbumManager{
  private static async fillPreviewToAlbum(album: AlbumBaseDTO): Promise<void> {
    if (!(album as SavedSearchDTO).searchQuery) {
      throw new Error('no search query present');
    }
    album.preview = await (ObjectManagers.getInstance().SearchManager as ISQLSearchManager)
      .getPreview((album as SavedSearchDTO).searchQuery);
  }

  public async addSavedSearch(name: string, searchQuery: SearchQueryDTO): Promise<void> {
    const connection = await SQLConnection.getConnection();
    await connection.getRepository(SavedSearchEntity).insert({name, searchQuery});

  }

  public async deleteAlbum(id: number): Promise<void> {
    const connection = await SQLConnection.getConnection();
    await connection.getRepository(AlbumBaseEntity).delete({id});
  }

  public async getAlbums(): Promise<AlbumBaseDTO[]> {
    const connection = await SQLConnection.getConnection();
    const albums = await connection.getRepository(AlbumBaseEntity).find();
    for (const a of albums) {
      await AlbumManager.fillPreviewToAlbum(a);
    }

    return albums;
  }
}
