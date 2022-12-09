import {AlbumBaseDTO} from '../../../../common/entities/album/AlbumBaseDTO';
import {IAlbumManager} from '../interfaces/IAlbumManager';

export class AlbumManager implements IAlbumManager {
  resetPreviews(): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  onNewDataVersion(): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  public async addIfNotExistSavedSearch(): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  public async addSavedSearch(): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  public async deleteAlbum(): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  public async getAlbums(): Promise<AlbumBaseDTO[]> {
    throw new Error('not supported by memory DB');
  }
}
