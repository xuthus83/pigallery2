import {Injectable} from '@angular/core';
import {NetworkService} from '../../model/network/network.service';
import {BehaviorSubject} from 'rxjs';
import {AlbumBaseDTO} from '../../../../common/entities/album/AlbumBaseDTO';


@Injectable()
export class AlbumsService {
  public albums: BehaviorSubject<AlbumBaseDTO[]>;

  constructor(private networkService: NetworkService) {
    this.albums = new BehaviorSubject<AlbumBaseDTO[]>(null);
  }


  public async getAlbums(): Promise<void> {
    this.albums.next((await this.networkService.getJson<AlbumBaseDTO[]>('/albums'))
      .sort((a, b): number => a.name.localeCompare(b.name)));
  }

  async deleteAlbum(album: AlbumBaseDTO): Promise<void> {
    await this.networkService.deleteJson('/albums/' + album.id);
    await this.getAlbums();
  }
}
